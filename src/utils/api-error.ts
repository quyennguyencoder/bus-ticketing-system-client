import axios from 'axios'

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message || data?.error || error.message || 'Co loi xay ra'
  }

  if (error instanceof Error) return error.message
  return 'Co loi xay ra'
}

