import {
  AbiDecodingZeroDataError,
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionZeroDataError,
  erc20Abi,
  HttpRequestError,
  UserRejectedRequestError,
} from 'viem'
import { describe, expect, it } from 'vitest'

import { getErrorMessage, isContractFailure } from './errors'

describe('getErrorMessage', () => {
  it('recognizes a rejection anywhere in the cause chain', () => {
    const rejection = new UserRejectedRequestError(new Error('User denied'))
    expect(getErrorMessage(rejection)).toBe('Request rejected in the wallet')
    expect(getErrorMessage(new BaseError('Switch failed', { cause: rejection }))).toBe(
      'Request rejected in the wallet',
    )
  })

  it('explains RPC connection failures', () => {
    const error = new BaseError('Request failed', { cause: new HttpRequestError({ url: 'https://rpc.example' }) })
    expect(getErrorMessage(error)).toBe('Could not reach the network. The RPC node did not respond, try again later.')
  })

  it('prefers the short message of viem errors', () => {
    expect(getErrorMessage(new BaseError('Chain not configured', { details: 'long details' }))).toBe(
      'Chain not configured',
    )
  })

  it('falls back to message and to a generic text', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage('boom')).toBe('Something went wrong')
  })
})

describe('isContractFailure', () => {
  const call = { abi: erc20Abi, functionName: 'symbol' } as const

  it('blames the contract for calls that return no data', () => {
    const error = new ContractFunctionExecutionError(new ContractFunctionZeroDataError(call), call)
    expect(isContractFailure(error)).toBe(true)
    expect(isContractFailure(new BaseError('decode', { cause: new AbiDecodingZeroDataError() }))).toBe(true)
  })

  it('does not blame the contract for network failures', () => {
    const error = new ContractFunctionExecutionError(new HttpRequestError({ url: 'https://rpc.example' }), call)
    expect(isContractFailure(error)).toBe(false)
    expect(isContractFailure(new Error('boom'))).toBe(false)
  })
})
