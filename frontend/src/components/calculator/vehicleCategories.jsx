import { FaCar, FaMotorcycle, FaTruck, FaTruckPickup, FaBus, FaVanShuttle, FaTaxi, FaTractor } from 'react-icons/fa6'

const VEHICLE_CATEGORIES = [
  { id: 'private_car', label: 'Private Car', icon: <FaCar className='h-7 w-7 sm:h-8 sm:w-8 text-blue-600' />, image: '/calculator/private%20car_converted.avif', desc: 'Personal 4-Wheeler', gradient: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { id: 'two_wheeler', label: '2W / Motorcycle', icon: <FaMotorcycle className='h-7 w-7 sm:h-8 sm:w-8 text-purple-600' />, image: '/calculator/2%20wheeler_converted.avif', desc: 'Scooter & Motorcycle', gradient: 'from-purple-500 to-violet-600', light: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { id: 'gcv', label: 'GCV', icon: <FaTruck className='h-7 w-7 sm:h-8 sm:w-8 text-orange-600' />, image: '/calculator/gcv_converted.avif', desc: 'Goods Carrying Vehicle', gradient: 'from-orange-500 to-amber-600', light: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { id: 'gcv_3w', label: '3W GCV', icon: <FaTruckPickup className='h-7 w-7 sm:h-8 sm:w-8 text-amber-600' />, image: '/calculator/gcv%203%20wheel_converted.avif', desc: '3-Wheeler Goods Vehicle', gradient: 'from-blue-400 to-amber-400', light: 'bg-blue-50 border-amber-200 hover:border-blue-400' },
  { id: 'pcv', label: 'BUS & MAXI', icon: <FaBus className='h-7 w-7 sm:h-8 sm:w-8 text-green-600' />, image: '/calculator/pcv_converted.avif', desc: '≥4W & >6 Passengers', gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50 border-green-200 hover:border-green-400' },
  { id: 'pcv_3w', label: '3W PCV', icon: <FaVanShuttle className='h-7 w-7 sm:h-8 sm:w-8 text-teal-600' />, image: '/calculator/3w%20pcv_converted.avif', desc: '3-Wheeler Passenger Vehicle', gradient: 'from-teal-500 to-cyan-600', light: 'bg-teal-50 border-teal-200 hover:border-teal-400' },
  { id: 'taxi', label: 'Taxi', icon: <FaTaxi className='h-7 w-7 sm:h-8 sm:w-8 text-rose-600' />, image: '/calculator/taxi_converted.avif', desc: '4W ≤6 Passengers', gradient: 'from-red-500 to-rose-600', light: 'bg-red-50 border-red-200 hover:border-red-400' },
  { id: 'misc_d', label: 'Misc-D Special', icon: <FaTractor className='h-7 w-7 sm:h-8 sm:w-8 text-slate-600' />, image: '/calculator/miscl%20d_converted.avif', desc: 'Special Vehicles & Tractors', gradient: 'from-slate-500 to-gray-600', light: 'bg-slate-50 border-slate-200 hover:border-slate-400' },
]

export default VEHICLE_CATEGORIES
