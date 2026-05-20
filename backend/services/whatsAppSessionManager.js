const path = require('path')
const fs = require('fs/promises')
const QRCode = require('qrcode')
const axios = require('axios')
const { Client, LocalAuth } = require('whatsapp-web.js')
const WhatsAppSession = require('../models/WhatsAppSession')

class WhatsAppSessionManager {
  constructor() {
    this.clients = new Map()
    this.startingPromises = new Map()
    this.defaultSessionKey = 'primary'
    this.qrCodesStore = new Map()
  }

  sanitizeSessionKey(value) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return normalized || this.defaultSessionKey
  }

  buildDefaultDisplayName(sessionKey) {
    if (sessionKey === this.defaultSessionKey) {
      return 'Primary Session'
    }

    return sessionKey
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  async ensureDefaultSession() {
    const session = await WhatsAppSession.findOneAndUpdate(
      { sessionKey: this.defaultSessionKey },
      {
        $setOnInsert: {
          sessionKey: this.defaultSessionKey,
          isActive: true,
        },
        $set: {
          displayName: 'Primary Session',
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return session
  }

  async listSessions() {
    await this.ensureDefaultSession()
    const sessions = await WhatsAppSession.find({}).sort({ createdAt: 1 })
    return sessions
  }

  async getSession(sessionKey = this.defaultSessionKey) {
    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    const session = await WhatsAppSession.findOneAndUpdate(
      { sessionKey: normalizedKey },
      {
        $setOnInsert: {
          sessionKey: normalizedKey,
          isActive: normalizedKey === this.defaultSessionKey,
        },
        $set: {
          displayName: this.buildDefaultDisplayName(normalizedKey),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )

    return session
  }

  async createSession({ sessionKey, displayName, phoneNumber }) {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsappserver.softwarebytes.in/api/v1'

    if (apiKey) {
      try {
        const response = await axios.post(`${apiUrl}/sessions/add`, {}, {
          headers: { 'x-api-key': apiKey }
        })
        const result = response.data
        if (result && result.success) {
          const sessId = result.sessionId
          if (result.qr) {
            this.qrCodesStore.set(sessId, result.qr)
          }

          // Save a local shadow copy in our MongoDB to remember the user-entered phone number and displayName
          try {
            await WhatsAppSession.create({
              sessionKey: sessId,
              displayName: String(displayName || sessId).trim(),
              phoneNumber: phoneNumber || null,
              status: 'qr_ready',
              qrCodeDataUrl: result.qr || null,
              isActive: true,
            })
          } catch (dbErr) {
            console.error('Failed to create local shadow copy of external session:', dbErr.message)
          }

          return {
            sessionKey: sessId,
            displayName: String(displayName || sessId).trim(),
            status: 'qr_ready',
            qrCodeDataUrl: result.qr || null,
            phoneNumber: phoneNumber || null,
            isActive: true
          }
        } else {
          throw new Error(result.message || 'Failed to add external session')
        }
      } catch (error) {
        console.error('Failed to create external session:', error.response?.data || error.message)
        throw new Error(error.response?.data?.message || error.message || 'Failed to create external session')
      }
    }

    const normalizedKey = this.sanitizeSessionKey(sessionKey || displayName)
    const existing = await WhatsAppSession.findOne({ sessionKey: normalizedKey })
    if (existing) {
      throw new Error('A WhatsApp session with this name already exists')
    }

    const hasActiveSession = await WhatsAppSession.exists({ isActive: true })
    return WhatsAppSession.create({
      sessionKey: normalizedKey,
      displayName: String(displayName || this.buildDefaultDisplayName(normalizedKey)).trim(),
      isActive: !hasActiveSession,
    })
  }

  hasClient(sessionKey) {
    if (sessionKey) {
      return this.clients.has(this.sanitizeSessionKey(sessionKey))
    }

    for (const session of this.clients.values()) {
      if (session) return true
    }
    return false
  }

  async getActiveSession() {
    await this.ensureDefaultSession()
    let session = await WhatsAppSession.findOne({ isActive: true })
    if (!session) {
      session = await WhatsAppSession.findOneAndUpdate(
        { sessionKey: this.defaultSessionKey },
        { $set: { isActive: true, displayName: 'Primary Session' } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )
    }

    return session
  }

  async setActiveSession(sessionKey) {
    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    const session = await this.getSession(normalizedKey)

    await WhatsAppSession.updateMany({}, { $set: { isActive: false } })
    await WhatsAppSession.updateOne({ sessionKey: normalizedKey }, { $set: { isActive: true } })
    return this.getSession(session.sessionKey)
  }

  async getStatus() {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsappserver.softwarebytes.in/api/v1'

    if (apiKey) {
      try {
        const response = await axios.get(`${apiUrl}/sessions`, {
          headers: { 'x-api-key': apiKey }
        })
        let extSessions = response.data?.sessions || []

        if (extSessions.length === 0) {
          try {
            const responseAdd = await axios.post(`${apiUrl}/sessions/add`, {}, {
              headers: { 'x-api-key': apiKey }
            })
            if (responseAdd.data && responseAdd.data.success) {
              const sessId = responseAdd.data.sessionId
              if (responseAdd.data.qr) {
                this.qrCodesStore.set(sessId, responseAdd.data.qr)
              }
              await WhatsAppSession.create({
                sessionKey: sessId,
                displayName: 'Primary Session',
                status: 'qr_ready',
                qrCodeDataUrl: responseAdd.data.qr || null,
                isActive: true,
              }).catch(() => {})

              extSessions.push({
                sessionId: sessId,
                connected: false
              })
            }
          } catch (addErr) {
            console.error('Failed to auto-create external session:', addErr.message)
          }
        }

        // Fetch local shadow copies to merge user-entered names/phones
        const locals = await WhatsAppSession.find({})
        const localMap = new Map(locals.map(l => [l.sessionKey, l]))

        const sessions = extSessions.map(s => {
          const connected = s.connected
          if (connected) {
            this.qrCodesStore.delete(s.sessionId)
          }

          const local = localMap.get(s.sessionId)
          const dispName = local?.displayName || s.sessionId
          const phone = s.number ? s.number.split('@')[0] : (local?.phoneNumber || 'Not connected')

          return {
            sessionKey: s.sessionId,
            displayName: dispName,
            status: connected ? 'authenticated' : (this.qrCodesStore.has(s.sessionId) ? 'qr_ready' : 'disconnected'),
            phoneNumber: phone,
            isActive: true,
            qrCodeDataUrl: this.qrCodesStore.get(s.sessionId) || null
          }
        })
        return {
          sessions,
          activeSessionKey: sessions[0]?.sessionKey || null
        }
      } catch (error) {
        console.error('Failed to fetch external WhatsApp sessions:', error.message)
        return { sessions: [], activeSessionKey: null }
      }
    }

    const sessions = await this.listSessions()
    const activeSession = sessions.find((session) => session.isActive) || null

    return {
      sessions,
      activeSessionKey: activeSession?.sessionKey || null,
    }
  }

  async updateSession(sessionKey, update) {
    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    return WhatsAppSession.findOneAndUpdate(
      { sessionKey: normalizedKey },
      {
        $set: {
          ...update,
          displayName: update.displayName || undefined,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    )
  }

  getAuthBaseDir() {
    return process.env.WHATSAPP_AUTH_DIR || path.join(process.cwd(), '.wwebjs_auth')
  }

  getAuthDir(sessionKey) {
    return path.join(this.getAuthBaseDir(), `session-${this.getClientId(sessionKey)}`)
  }

  getClientId(sessionKey) {
    return `transport-admin-${this.sanitizeSessionKey(sessionKey)}`
  }

  getLegacyAuthDir(sessionKey) {
    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    if (normalizedKey !== this.defaultSessionKey) {
      return null
    }

    return path.join(this.getAuthBaseDir(), 'session-transport-admin')
  }

  async migrateLegacyAuthDir(sessionKey) {
    const legacyAuthDir = this.getLegacyAuthDir(sessionKey)
    if (!legacyAuthDir) return

    const nextAuthDir = this.getAuthDir(sessionKey)

    try {
      await fs.access(legacyAuthDir)
    } catch (_error) {
      return
    }

    try {
      await fs.access(nextAuthDir)
      return
    } catch (_error) {
      // target folder does not exist yet
    }

    await fs.rename(legacyAuthDir, nextAuthDir)
  }

  isRecoverableProtocolError(error) {
    const message = String(error?.message || '')
    return (
      message.includes('Execution context was destroyed') ||
      message.includes('Cannot find context with specified id') ||
      message.includes('Target closed') ||
      message.includes('Session closed')
    )
  }

  async startSession(sessionKey = this.defaultSessionKey) {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsappserver.softwarebytes.in/api/v1'

    if (apiKey) {
      try {
        const response = await axios.post(`${apiUrl}/sessions/${sessionKey}/reconnect`, {}, {
          headers: { 'x-api-key': apiKey }
        })
        const result = response.data
        if (result && result.success) {
          if (result.qr) {
            this.qrCodesStore.set(sessionKey, result.qr)
          }
          return {
            sessionKey,
            displayName: sessionKey,
            status: 'qr_ready',
            qrCodeDataUrl: result.qr || null,
            phoneNumber: null,
            isActive: true
          }
        } else {
          throw new Error(result.message || 'Failed to reconnect external session')
        }
      } catch (error) {
        console.error('Failed to reconnect external session:', error.response?.data || error.message)
        throw new Error(error.response?.data?.message || error.message || 'Failed to reconnect external session')
      }
    }

    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    if (this.startingPromises.has(normalizedKey)) {
      return this.startingPromises.get(normalizedKey)
    }

    const startPromise = this.startSessionInternal(normalizedKey)
    this.startingPromises.set(normalizedKey, startPromise)
    try {
      return await startPromise
    } finally {
      this.startingPromises.delete(normalizedKey)
    }
  }

  async startSessionInternal(sessionKey) {
    const session = await this.getSession(sessionKey)
    const existingClient = this.clients.get(sessionKey)

    if (existingClient) {
      try {
        await existingClient.getState()
        return session
      } catch (_error) {
        await this.stopSession(sessionKey)
      }
    }

    await this.migrateLegacyAuthDir(sessionKey)

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.getClientId(sessionKey),
        dataPath: this.getAuthBaseDir(),
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      },
    })

    client.on('qr', async (qr) => {
      const qrCodeDataUrl = await QRCode.toDataURL(qr, { width: 300 })
      await this.updateSession(sessionKey, {
        status: 'qr_ready',
        qrCodeDataUrl,
        lastError: null,
      })
    })

    client.on('authenticated', async () => {
      await this.updateSession(sessionKey, {
        status: 'initializing',
        lastError: null,
      })
    })

    client.on('ready', async () => {
      await this.updateSession(sessionKey, {
        status: 'authenticated',
        phoneNumber: client.info?.wid?.user || null,
        lastConnectedAt: new Date(),
        qrCodeDataUrl: null,
        lastError: null,
      })
    })

    client.on('auth_failure', async (message) => {
      await this.updateSession(sessionKey, {
        status: 'auth_failure',
        lastError: message || 'Authentication failure',
      })
    })

    client.on('disconnected', async (reason) => {
      this.clients.delete(sessionKey)
      await this.updateSession(sessionKey, {
        status: 'disconnected',
        qrCodeDataUrl: null,
        lastError: typeof reason === 'string' ? reason : 'Disconnected from WhatsApp Web',
      })
    })

    this.clients.set(sessionKey, client)
    await this.updateSession(sessionKey, { status: 'initializing', lastError: null })
    await client.initialize()
    return this.getSession(sessionKey)
  }

  async stopSession(sessionKey = this.defaultSessionKey) {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsappserver.softwarebytes.in/api/v1'

    if (apiKey) {
      try {
        await axios.delete(`${apiUrl}/sessions/${sessionKey}`, {
          headers: { 'x-api-key': apiKey }
        })
        this.qrCodesStore.delete(sessionKey)
        return {
          sessionKey,
          displayName: sessionKey,
          status: 'disconnected',
          qrCodeDataUrl: null,
          phoneNumber: null,
          isActive: true
        }
      } catch (error) {
        console.error('Failed to delete external session:', error.response?.data || error.message)
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete external session')
      }
    }

    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    const client = this.clients.get(normalizedKey)

    if (client) {
      try {
        await client.destroy()
      } catch (_error) {
        // ignore destroy errors
      }
      this.clients.delete(normalizedKey)
    }

    await this.updateSession(normalizedKey, {
      status: 'disconnected',
      qrCodeDataUrl: null,
      lastError: null,
    })

    return this.getSession(normalizedKey)
  }

  async resetSession(sessionKey = this.defaultSessionKey) {
    const apiKey = process.env.WHATSAPP_API_KEY
    if (apiKey) {
      return this.stopSession(sessionKey)
    }

    const normalizedKey = this.sanitizeSessionKey(sessionKey)
    await this.stopSession(normalizedKey)

    try {
      await fs.rm(this.getAuthDir(normalizedKey), { recursive: true, force: true })
    } catch (_error) {
      // ignore auth dir cleanup errors
    }

    await this.updateSession(normalizedKey, {
      status: 'new',
      qrCodeDataUrl: null,
      phoneNumber: null,
      lastConnectedAt: null,
      lastError: null,
    })

    return this.getSession(normalizedKey)
  }

  normalizeRecipient(recipient) {
    return String(recipient || '').replace(/[^\d]/g, '')
  }

  async resolveRecipientChatId(client, recipient) {
    const normalized = this.normalizeRecipient(recipient)
    if (!normalized) {
      throw new Error('Recipient number is invalid')
    }

    const candidates = [normalized, `+${normalized}`]
    for (const candidate of candidates) {
      try {
        const numberId = await client.getNumberId(candidate)
        if (numberId?._serialized) {
          return numberId._serialized
        }
      } catch (_error) {
        // continue
      }
    }

    return `${normalized}@c.us`
  }

  async getSenderClient(sessionKey) {
    if (sessionKey) {
      const normalizedKey = this.sanitizeSessionKey(sessionKey)
      const client = this.clients.get(normalizedKey)
      if (!client) {
        throw new Error('WhatsApp session is not active')
      }
      return { client, sessionKey: normalizedKey }
    }

    const activeSession = await this.getActiveSession()
    const client = this.clients.get(activeSession.sessionKey)
    if (!client) {
      throw new Error('Active WhatsApp session is not connected')
    }

    return { client, sessionKey: activeSession.sessionKey }
  }

  async sendTextMessage(recipient, text, sessionKey) {
    const apiKey = process.env.WHATSAPP_API_KEY
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://whatsappserver.softwarebytes.in/api/v1'

    if (apiKey) {
      try {
        const response = await axios.post(
          `${apiUrl}/messages/send`,
          {
            messages: [
              {
                number: recipient,
                text: text
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            }
          }
        )

        if (response.data && response.data.success) {
          return response.data.jobId || 'success'
        } else {
          throw new Error(response.data?.message || 'External WhatsApp API returned success false')
        }
      } catch (error) {
        console.error('External WhatsApp API error:', error.response?.data || error.message)
        throw new Error(error.response?.data?.message || error.message || 'Failed to send message via External API')
      }
    }

    const { client, sessionKey: resolvedSessionKey } = await this.getSenderClient(sessionKey)

    try {
      const chatId = await this.resolveRecipientChatId(client, recipient)
      const result = await client.sendMessage(chatId, text)
      return result?.id?._serialized || null
    } catch (error) {
      if (this.isRecoverableProtocolError(error)) {
        await this.stopSession(resolvedSessionKey)
        throw new Error('WhatsApp session reset. Please reconnect by scanning QR again.')
      }
      throw error
    }
  }

  async restoreSessions() {
    const sessions = await this.listSessions()
    await Promise.all(
      sessions.map(async (session) => {
        if (!['authenticated', 'initializing', 'qr_ready'].includes(session.status)) {
          return
        }

        try {
          await this.startSession(session.sessionKey)
        } catch (error) {
          await this.updateSession(session.sessionKey, {
            status: 'disconnected',
            lastError: `Restore failed: ${error.message}`,
          })
        }
      })
    )
  }
}

module.exports = new WhatsAppSessionManager()
