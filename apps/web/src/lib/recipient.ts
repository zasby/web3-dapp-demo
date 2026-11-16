import { type Address, isAddress, isAddressEqual } from 'viem'

/** Error for the Send form's recipient field, or undefined when it is fine (or still empty). */
export function getRecipientError(recipient: string, ownAddress: Address): string | undefined {
  if (!recipient) return undefined
  if (!isAddress(recipient)) return 'Not a valid address'
  // A transfer to yourself costs gas and moves nothing; usually it is a paste mistake.
  if (isAddressEqual(recipient, ownAddress)) return 'This is your own address'
  return undefined
}
