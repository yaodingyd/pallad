import { ProviderConfig } from '@palladxyz/providers'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useVault } from '../../src'
import { DEFAULT_NETWORK_INFO } from '../../src/network-info/default'

describe('CredentialStore', () => {
  let networkNameMainnet: string
  let networkNameBerkeley: string
  let networkNameRopsten: string
  let providerConfigMainnet: ProviderConfig
  let providerConfigBerkeley: ProviderConfig
  let providerConfigRopsten: ProviderConfig

  const mockUrl = 'https://...'
  const networkType = 'testnet'

  beforeEach(() => {
    networkNameMainnet = 'Mainnet'
    networkNameRopsten = 'Ropsten'
    // don't use the same network name
    networkNameBerkeley = 'Berkeley Other'
    providerConfigMainnet = {
      nodeEndpoint: {
        providerName: 'mina-node',
        url: mockUrl
      },
      archiveNodeEndpoint: {
        providerName: 'mina-explorer',
        url: mockUrl
      },
      networkName: networkNameMainnet,
      networkType: networkType,
      chainId: '...'
    }
    providerConfigBerkeley = {
      nodeEndpoint: {
        providerName: 'mina-node',
        url: mockUrl
      },
      archiveNodeEndpoint: {
        providerName: 'mina-node',
        url: mockUrl
      },
      networkName: networkNameBerkeley,
      networkType: networkType,
      chainId: '...'
    }
    providerConfigRopsten = {
      nodeEndpoint: {
        providerName: 'eth-node',
        url: 'https://ropsten.ethereum.org'
      },
      archiveNodeEndpoint: {
        providerName: 'eth-archive',
        url: 'https://ropsten.archive.ethereum.org'
      },
      networkName: networkNameRopsten,
      networkType: networkType,
      chainId: '3'
    }
  })

  afterEach(() => {
    const { result } = renderHook(() => useVault())
    act(() => result.current.clear())
  })

  it('should create a network info store', () => {
    const { result } = renderHook(() => useVault())
    expect(result.current.networkInfo).toEqual(DEFAULT_NETWORK_INFO)
  })

  it('should add one network and remove one from store', () => {
    let providerConfig: ProviderConfig | undefined
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameMainnet, providerConfigMainnet)
      providerConfig = result.current.getNetworkInfo(networkNameMainnet)
    })
    expect(providerConfig).toEqual(providerConfigMainnet)
    act(() => {
      result.current.removeNetworkInfo(networkNameMainnet)
      providerConfig = result.current.getNetworkInfo(networkNameMainnet)
    })
    expect(providerConfig).toBeUndefined()
  })

  it('should add two networks', () => {
    let providerConfig: ProviderConfig | undefined
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameMainnet, providerConfigMainnet)
      result.current.setNetworkInfo(networkNameBerkeley, providerConfigBerkeley)
      providerConfig = result.current.getNetworkInfo(networkNameMainnet)
    })
    expect(providerConfig).toEqual(providerConfigMainnet)
    providerConfig = result.current.getNetworkInfo(networkNameBerkeley)
    expect(providerConfig).toEqual(providerConfigBerkeley)

    // check total number of networks
    const networks = result.current.allNetworkInfo()
    expect(networks.length).toEqual(
      Object.keys(DEFAULT_NETWORK_INFO).length + 2
    )
  })
  it('should add two networks and set mainnet as current network', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameMainnet, providerConfigMainnet)
      result.current.setNetworkInfo(networkNameBerkeley, providerConfigBerkeley)
      result.current.setCurrentNetworkName(networkNameMainnet)
    })
    const currentNetworkInfo = result.current.getCurrentNetworkInfo()
    expect(currentNetworkInfo).toEqual(currentNetworkInfo)
  })
  it('should get all chainIds', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameMainnet, providerConfigMainnet)
      result.current.setNetworkInfo(networkNameBerkeley, providerConfigBerkeley)
    })
    const chainIds = result.current.getChainIds()
    expect(chainIds.length).toEqual(
      Object.keys(DEFAULT_NETWORK_INFO).length + 2
    )
  })
  it('should update existing network info', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameRopsten, providerConfigRopsten)
      result.current.updateNetworkInfo(networkNameRopsten, { chainId: '4' })
    })
    const updatedNetworkInfo = result.current.getNetworkInfo(networkNameRopsten)
    expect(updatedNetworkInfo.chainId).toEqual('4')
  })

  it('should not update non-existing network info', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.updateNetworkInfo('NonExisting', { chainId: '10' })
    })
    const updatedNetworkInfo = result.current.getNetworkInfo('NonExisting')
    expect(updatedNetworkInfo).toBeUndefined()
  })

  it('should handle setting and getting the current network info', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameRopsten, providerConfigRopsten)
      result.current.setCurrentNetworkName(networkNameRopsten)
    })
    const currentNetworkInfo = result.current.getCurrentNetworkInfo()
    expect(currentNetworkInfo).toEqual(providerConfigRopsten)
  })

  it('should return undefined for non-existent current network', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setCurrentNetworkName('NonExistentNetwork')
    })
    const currentNetworkInfo = result.current.getCurrentNetworkInfo()
    expect(currentNetworkInfo).toBeUndefined()
  })

  it.skip('should clear all network info', () => {
    const { result } = renderHook(() => useVault())
    act(() => {
      result.current.setNetworkInfo(networkNameRopsten, providerConfigRopsten)
      result.current.clear()
    })
    const networks = result.current.allNetworkInfo()
    expect(networks.length).toEqual(0)
  })
})
