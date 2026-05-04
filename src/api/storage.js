// API interface layer — thin wrapper around localForage (stub for future backend migration)
import localforage from 'localforage'
import { STORAGE_KEYS } from '../utils/storageHelper.js'

export async function getItem(key) {
  return localforage.getItem(key)
}

export async function setItem(key, value) {
  return localforage.setItem(key, value)
}

export async function removeItem(key) {
  return localforage.removeItem(key)
}

export { STORAGE_KEYS }
