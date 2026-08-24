'use client'

import { useEffect, useState } from 'react'

interface AsyncData<T> {
  data: T | null
  setData: React.Dispatch<React.SetStateAction<T | null>>
  isLoading: boolean
  error: Error | null
}

/**
 * Replaces the copy-pasted `useEffect` + `useState` fetch block that every
 * page used to implement by hand, and adds loading/error tracking on top.
 *
 * The effect re-runs whenever `deps` change; in-flight results are discarded
 * on unmount or dependency change. Previous data stays visible (isLoading
 * stays false) until the new result arrives, avoiding loader flicker.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncData<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
          setError(null)
          setIsLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, isLoading, error }
}
