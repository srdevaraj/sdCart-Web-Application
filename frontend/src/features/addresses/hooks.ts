import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/auth-store'
import { addressService } from '@/services/addresses'
import type { AddressRequest } from '@/types'

export const addressKeys = {
  all: ['addresses'] as const,
}

export function useAddresses() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: () => addressService.list(),
    enabled: isAuthed,
    staleTime: 30_000,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddressRequest) => addressService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: AddressRequest }) =>
      addressService.update(publicId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => addressService.remove(publicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => addressService.setDefault(publicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
