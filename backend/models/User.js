const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true
        return /^[0-9]{10}$/.test(v)
      },
      message: 'Mobile must be 10 digits'
    }
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  picture: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Pre-save hook to handle sparse unique indexes
userSchema.pre('save', function() {
  // If mobile is null or empty string, set it to undefined so sparse index ignores it
  if (this.mobile === null || this.mobile === '') {
    this.mobile = undefined
  }
  // Same for googleId just in case
  if (this.googleId === null || this.googleId === '') {
    this.googleId = undefined
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
