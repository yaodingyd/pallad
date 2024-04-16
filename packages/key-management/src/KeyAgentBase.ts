import { HDKey } from '@scure/bip32'

import { EthereumSignablePayload, EthereumSigningOperations } from './chains'
import { MinaSignablePayload } from './chains/Mina'
import { MinaSigningOperations } from './chains/Mina/signingOperations'
import { emip3encrypt } from './emip3'
import * as errors from './errors'
import { getPassphraseRethrowTypedError } from './InMemoryKeyAgent'
import { KeyDecryptor } from './KeyDecryptor'
import {
  ChainDerivationArgs,
  ChainKeyPair,
  ChainOperationArgs,
  ChainPrivateKey,
  ChainSignablePayload,
  ChainSignatureResult,
  createChainDerivationOperationsProvider,
  credentialDerivers,
  credentialMatchers,
  GetPassphrase
} from './types'
import { GroupedCredentials, KeyAgent, SerializableKeyAgentData } from './types'

export abstract class KeyAgentBase implements KeyAgent {
  readonly serializableData: SerializableKeyAgentData
  private keyDecryptor: KeyDecryptor
  // private #getPassphrase: GetPassphrase

  get knownCredentials(): GroupedCredentials[] {
    return this.serializableData.credentialSubject.contents
  }
  set knownCredentials(credentials: GroupedCredentials[]) {
    this.serializableData.credentialSubject.contents = credentials
  }

  constructor(
    serializableData: SerializableKeyAgentData,
    getPassphrase: GetPassphrase
  ) {
    this.serializableData = serializableData
    this.keyDecryptor = new KeyDecryptor(getPassphrase)
  }

  async decryptSeed(): Promise<Uint8Array> {
    // TODO: add passphrase as an argument?
    try {
      return await this.keyDecryptor.decryptSeedBytes(this.serializableData)
    } catch (error) {
      throw new Error(`Failed to decrypt root private key: ${error}`)
    }
  }

  async exportRootPrivateKey(): Promise<Uint8Array> {
    // TODO: add passphrase as an argument?
    try {
      const decryptedSeedBytes = await this.decryptSeed()
      const rootKey = HDKey.fromMasterSeed(decryptedSeedBytes)
      return rootKey.privateKey ? rootKey.privateKey : new Uint8Array([])
    } catch (error) {
      throw new errors.AuthenticationError(
        'Failed to export root private key',
        error
      )
    }
  }

  async deriveCredentials(
    args: ChainDerivationArgs,
    getPassphrase: GetPassphrase,
    pure?: boolean
  ): Promise<GroupedCredentials> {
    const passphrase = await getPassphraseRethrowTypedError(getPassphrase)
    console.log('network (should be ethereum):', args.network)
    const matcher = credentialMatchers[args.network]
    if (!matcher) {
      throw new Error(`Unsupported network: ${args.network}`)
    }

    const knownCredential =
      this.serializableData.credentialSubject.contents.find((credential) =>
        matcher(credential, args)
      )

    if (knownCredential) return knownCredential

    const derivedKeyPair = await this.deriveKeyPair(args, passphrase)

    try {
      const deriveFunction = credentialDerivers[args.network]
      if (!deriveFunction) {
        throw new Error(`Unsupported network: ${args.network}`)
      }
      const groupedCredential = deriveFunction(
        args,
        derivedKeyPair.publicKey,
        derivedKeyPair.encryptedPrivateKeyBytes
      )

      if (!pure) {
        this.serializableData.credentialSubject.contents = [
          ...this.serializableData.credentialSubject.contents,
          groupedCredential
        ]
      }
      return groupedCredential
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async deriveKeyPair(
    args: ChainDerivationArgs,
    passphrase: Uint8Array
  ): Promise<ChainKeyPair> {
    // Generate the private key
    const privateKey = await this.#generatePrivateKeyFromSeed(args)
    const encryptedPrivateKeyBytes = await emip3encrypt(
      Buffer.from(privateKey),
      passphrase
    )
    const provider = createChainDerivationOperationsProvider(args)

    try {
      const keyPair = {
        publicKey: await provider.derivePublicKey(privateKey),
        encryptedPrivateKeyBytes
      }
      return keyPair
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async sign<T extends GroupedCredentials>(
    payload: T,
    signable: ChainSignablePayload,
    args: ChainOperationArgs
  ): Promise<ChainSignatureResult> {
    const encryptedPrivateKeyBytes = payload.encryptedPrivateKeyBytes
    const decryptedKeyBytes = await this.keyDecryptor.decryptChildPrivateKey(
      encryptedPrivateKeyBytes
    )

    let privateKey: string | null = Buffer.from(decryptedKeyBytes).toString()

    try {
      let result
      if (args.network === 'Mina') {
        result = MinaSigningOperations(
          signable as MinaSignablePayload,
          args,
          privateKey
        )
      } else if (args.network === 'Ethereum') {
        result = EthereumSigningOperations(
          signable as EthereumSignablePayload,
          args,
          privateKey
        )
      } else {
        throw new Error('Unsupported network')
      }

      // Overwrite and nullify the privateKey
      privateKey = '0'.repeat(privateKey.length)
      privateKey = null

      return result
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /*async #generatePrivateKeyFromSeed<T extends ChainSpecificPayload>(
    payload: T,
    args: ChainDerivationArgs
  ): Promise<ChainPrivateKey> {
    // Decrypt your seed
    const decryptedSeedBytes = await this.decryptSeed()

    // Perform the specific derivation
    try {
      return await payload.derivePrivateKey(decryptedSeedBytes, args)
    } catch (error) {
      console.error(error)
      throw error
    }
  }*/
  // new functional generatePrivateKeyFromSeed
  async #generatePrivateKeyFromSeed<T extends ChainDerivationArgs>(
    args: T
  ): Promise<ChainPrivateKey> {
    // Decrypt your seed
    const decryptedSeedBytes = await this.decryptSeed()
    const provider = createChainDerivationOperationsProvider(args)

    return provider.derivePrivateKey(decryptedSeedBytes)
  }
}
