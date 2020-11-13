<template>
    <div class="certifaction-verification"
         @dragover.prevent="dragOver"
         @dragleave="dragLeave"
         @drop.prevent="handleDrop">

        <VerificationDropBox
            v-show="dropbox.draggingOver"
            :first-verification="filteredVerificationItems.length === 0"/>

        <div v-show="!dropbox.draggingOver">
            <VerificationDemo v-if="demo !== false" @verify-demo="verifyDemo" @dragging-demo-doc="onDraggingDemoDoc"/>
            <button @click="verifyDemoFile">VERIFY DEMO FILE</button>

            <div v-if="filteredVerificationItems.length" class="verification-item-list" ref="results">
                <VerificationItem
                    v-for="verificationItem in filteredVerificationItems"
                    :key="verificationItem.hash"
                    :verificationItem="verificationItem"
                    :certifaction-api-url="certifactionApiUrl"/>
            </div>

            <VerificationFileSelector @files-selected="verify"
                                      :first-verification="filteredVerificationItems.length === 0"/>

            <div class="powered-by">
                <span class="label">{{ _$t('verification.poweredBy.label') }}</span>
                <a href="https://certifaction.com" target="_blank">
                    <img src="../assets/img/certifaction_logo.svg" alt="Certifaction"/>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import {
    CertifactionEthVerifier,
    hashingService,
    Interface,
    mapVerificationItemType,
    VerifierInterface
} from '@certifaction/verification-core'
import i18nWrapperMixin from '../mixins/i18n-wrapper'
import VerificationDemo from './Verification/VerificationDemo.vue'
import VerificationFileSelector from './Verification/VerificationFileSelector.vue'
import VerificationDropBox from './Verification/VerificationDropBox.vue'
import VerificationItem from './Verification/items/VerificationItem.vue'
import demoDocuments from '../resources/demo/demo-documents'

export default {
    name: 'CertifactionVerification',
    mixins: [
        i18nWrapperMixin
    ],
    components: {
        VerificationDemo,
        VerificationFileSelector,
        VerificationDropBox,
        VerificationItem
    },
    props: {
        demo: {
            type: Boolean,
            required: false,
            default: false
        },
        enableClaims: {
            type: Boolean,
            required: false,
            default: false
        },
        providerUrl: {
            type: String,
            required: false
        },
        legacyContractAddress: {
            type: String,
            required: false
        },
        legacyContractFallbackAddresses: {
            type: Array,
            required: false
        },
        claimContractAddress: {
            type: String,
            required: false
        },
        acceptedIssuerKey: {
            type: String,
            required: false
        },
        certifactionApiUrl: {
            type: String,
            required: false
        },
        offchainVerifier: {
            type: Object,
            required: false,
            validator(value) {
                Interface.ensureImplements(value, VerifierInterface)
                return true
            }
        }
    },
    data() {
        return {
            certifactionEthVerifier: new CertifactionEthVerifier(
                this.enableClaims,
                this.providerUrl,
                this.legacyContractAddress,
                this.legacyContractFallbackAddresses,
                this.claimContractAddress,
                this.acceptedIssuerKey,
                this.certifactionApiUrl
            ),
            verificationItems: [],
            draggingDemoDoc: undefined,
            dropbox: {
                draggingOver: false,
                dragLeaveLocked: false
            }, // 1. hin dev, 2. normal registering, 3. normal, 4. normal revoking, 5. normal revoked
            demoFiles: [
                {
                    hashed: true,
                    type: 2,
                    file: {},
                    name: 'hin_dev_testnet_121120201800.pdf',
                    hash: '0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                    onBlockchain: true,
                    issuerAddress: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                    issuerName: 'Dr. Test Emeka Eric M. Mosanya',
                    issuerImg: null,
                    issuerVerified: false,
                    issuerVerifiedBy: 'Health Info Net AG',
                    issuerVerifiedImg: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png',
                    revoked: false,
                    expiry: null,
                    registrationEvent: {
                        address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                        blockHash: '0xccf153e7531f62f4d2fc950490ce92f67e0a88d596d92a8a335127420075f937',
                        blockNumber: 9057689,
                        logIndex: 10,
                        removed: false,
                        transactionHash: '0xfad85e32d49ec7c54e7c9a648b91dce0b914abd16f0e84d041aa135280943f79',
                        transactionIndex: 21,
                        id: 'log_80a78d26',
                        returnValues: {
                            0: '0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                            1: '0x3f9a8cf259db22b327e51f3d08c2389c49da468b0b823764d988e3e7120c14f7',
                            file: '0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                            hash: '0x3f9a8cf259db22b327e51f3d08c2389c49da468b0b823764d988e3e7120c14f7'
                        },
                        event: 'Claim',
                        signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                        raw: {
                            data: '0x3f9a8cf259db22b327e51f3d08c2389c49da468b0b823764d988e3e7120c14f7',
                            topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99']
                        }
                    },
                    registrationBlock: {
                        difficulty: '576118416',
                        extraData: '0xd883010917846765746886676f312e31358777696e646f7773',
                        gasLimit: 8000000,
                        gasUsed: 1650313,
                        hash: '0xccf153e7531f62f4d2fc950490ce92f67e0a88d596d92a8a335127420075f937',
                        logsBloom: '0x00200010000800000101000080000080000000804600000000a100000120001000440000200200000000008000000400000000080000000000000000000000000400100800000000000020080c0000a00000000000800000000000008008001800000000000000040200000000000000000008010000000000000010008000000000000080000000204000000800000000000001000000080000004000000000000000000000040000000000000000000000010004000000000080002000028000000002001000000000000000100000001000000800001000000000000020000040000000000200000002000080080040012000001000400000000080100001',
                        miner: '0x98cf91FEabFA64b676084A98d957d1807B2Abd61',
                        mixHash: '0x8f4a3176e280e9445bdc7507e06615539e6428ada291e259e4cc3e37d3f395d5',
                        nonce: '0x66c61461d6362d75',
                        number: 9057689,
                        parentHash: '0xd9a6f84314d70d22e3a3b9c3f7101923665725c3fff17e0a93f098670419737d',
                        receiptsRoot: '0x2891f06fe449b12e7c15f0cefe92287f5ce7ebb8305a06ba737bd8e3ce206904',
                        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                        size: 8015,
                        stateRoot: '0xd8879b28e08c8de73658622a920d6a21921b257037f1cb5fb0e714c14a47efd4',
                        timestamp: 1605216093,
                        totalDifficulty: '32073357374226696',
                        transactions: ['0x2b046ade6d63de58752c1567b1d2dc39b13aa4918e51bfbc727c2be100f286f6', '0x8a315b83229ba914fa82fefaa6aef2e0cd2cda8cb82999c86d5b05811e7eabbd', '0xd84a96c9ccd68a43a0cdbc4389696bc9bd5f0bd0b38df11012aef6e852cf1c10', '0x8c1133cf692ff989f906e9d41de247e8a420d617c9f57018072730ed7ee51be8', '0x60e60eecf9ca82f9e86dbe0e04f4ea459f9ddc6882cf8ce1e8082b09de2352bf', '0x2a0746427fd1531e8e3a6e1be51f9919af60c31f88d8c13878b80b0339a3f7ad', '0x3c9a3f01995f02a3c0bee6eb952947b738361f40cda15705bee7ff09d9c2368b', '0x0e3b16543d079ae9b0b2fc0f8be191708e91827ed8af84b29fe1256b39e05b71', '0x91f38642cc6d0a6de9e756a53d2bc71c2eb8441d64413981f7d7ae06aa7877fa', '0x20943cbb8894ea6f6a993b08495c885cb088109f5f85c6d185fc7989e30dc958', '0x3a249a800bd8461eb705c89f778e202646eacefc23b002baa45931ab62afb5b0', '0x62f4e4ba16d3e1733640db1962614bb9c9d6c8997a357e816f4e5505f93b56f5', '0xb662ac41ce8bab8e475a0c27ecd088c93818b97b24be5dba7241b735d816de15', '0xe1fb32593bd60313c2d3f1ef767279aab9d8189015c780ce89baea09e16ee56f', '0x3ad7bbbaeebfde097e09648f3b920ee4f4767e0b7c5465831e9185f5bb5a1a53', '0x8547e530890512864d9be5b2cf2b20dc80201361cad1cec7b9e10a57ca2877e4', '0xb92c9eeb2eea7aa5cd347f063ad68ad87d1f77064ee147f7ea4101db40822ba9', '0xdceb7fc9a4f3d4cde4437707a525d4b21a1043b351bd3ec81993047de85d0919', '0x2b9b2a92eadd9d42b2ec119979b187c7888a026697bcae14b56f72a8a52155f2', '0x83e42fbd4a7eb5116504fe719497de928d8f9aa84500115bc72f4b7f9fb0bd4e', '0xf1cb24eecdcddd9fc5e39c2920d9cac10c46fc870877f463b6456de9c67d86b1', '0xfad85e32d49ec7c54e7c9a648b91dce0b914abd16f0e84d041aa135280943f79', '0xa09107fa81ea48b2477e8a1e96bb7e9b9ebbfcd8e3995fbd5dd619f68b880cab', '0xfcee4ccc969a0f0651310d5e360118116e4043a2bcb907d4827b856c91b824f9', '0xcd1b8091b371fbb69b814f0344f0f41fb10e093b5364ef17f01b30a8e19af64d', '0x578a21df5acbf2f8a65833867fcd8d489f9e72eb247dc80a8d2acad244d09a02', '0x8a3b8b463196f7c60dd739cb4d8087e5f8b5b70509fa4fc455a9e935725d4318', '0x19132f9fa830351b59fb6ce03f7717596c4dc733bd947a4cac7b9f1c63833a3d', '0x5eac7a56de17e372f5774196dbb169c7887200a94d986318def15f36e90aaa20', '0xb65edf2f4f630917fb6fefb14942144b5b86ef95b6ffc067c425f2a9fca83a10', '0xceb097929d569bb848cc9d6c155ef36d74e0f6995aa32cd78df6d73080f22e89'],
                        transactionsRoot: '0x9e57390312259ee7900018d830da4ccd0b60a869082df0ad10a0dc59ce141ca4',
                        uncles: []
                    },
                    revocationEvent: null,
                    revocationBlock: null,
                    events: [{
                        ref: 'cert:hash:0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                        scope: 'sign',
                        date: '2020-11-12T21:21:33.000Z',
                        expiry: null,
                        issuer: 'Dr. Test Emeka Eric M. Mosanya',
                        identityVerifier: {
                            name: 'Health Info Net AG',
                            image: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png'
                        },
                        issuerAddress: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                        smartContractAddress: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                        transactionHash: '0xfad85e32d49ec7c54e7c9a648b91dce0b914abd16f0e84d041aa135280943f79'
                    }],
                    claims: [{
                        '@context': 'https://schema.certifaction.io/claim/v2',
                        '@id': 'cert:hash:0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                        exp: { value: 0 },
                        idclaims: [{
                            '@context': 'https://schema.certifaction.io/idclaim/v1',
                            '@id': 'cert:addr:0xf33dcb8d760c9b6103b28bc7dde84c44edfe3631',
                            name: 'Dr. Test Emeka Eric M. Mosanya',
                            proof: {
                                creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                                nonce: 'MY22qayukDdArFOt0sOP5lFOUAtMzHJk',
                                signatureValue: 'a0cfceba0c9dc189d65130d762c264168f7a073a94ad1faa34d19b662071023e6ec604d7805439b7342b84fcdbf3ccdf91a58d3aa26b8f6dbec5f771e0a2d4b500',
                                type: 'ECDSA'
                            },
                            verifiedBy: 'HIN'
                        }],
                        proof: {
                            creator: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                            nonce: 'tRk1SK5DDzi4xWnpNx6pEqcQDc5Nmlzx',
                            signatureValue: '4f93ca187d6c03f97d426a1432dceb1930b9ce7021a84fd1ba3844471168a3ac27d8bbaa784c3a86dc4105925e62babf94e3a94d7257ae47cb359a328754628000',
                            type: 'ECDSA'
                        },
                        scope: 'sign'
                    }],
                    loaded: true
                }, // 1. hin dev
                // {
                //     hashed: true,
                //     type: 2,
                //     file: {},
                //     name: 'dummy (3).pdf',
                //     hash: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //     onBlockchain: false,
                //     issuerName: 'Test',
                //     issuerVerified: false,
                //     status: 'registering',
                //     revoked: false,
                //     events: [{ scope: 'register', issuer: 'Test', identityVerifier: null }],
                //     loaded: true
                // } // 2. normal registering
                // {
                //     hashed: true,
                //     type: 2,
                //     file: {},
                //     name: 'dummy (3).pdf',
                //     hash: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //     onBlockchain: true,
                //     issuerAddress: '0x9a1c785eF5F19C3Cd6eB27B66CC318f2F425c5f6',
                //     issuerName: 'Test',
                //     issuerImg: null,
                //     issuerVerified: false,
                //     issuerVerifiedBy: null,
                //     issuerVerifiedImg: null,
                //     revoked: false,
                //     expiry: null,
                //     registrationEvent: {
                //         address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                //         blockHash: '0x9963b732b160e47923d08c952dbf2c7cc41b0b63ed9fa24782f7728f7b0990ef',
                //         blockNumber: 9056995,
                //         logIndex: 0,
                //         removed: false,
                //         transactionHash: '0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b',
                //         transactionIndex: 0,
                //         id: 'log_9171fef1',
                //         returnValues: {
                //             0: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             1: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a',
                //             file: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             hash: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a'
                //         },
                //         event: 'Claim',
                //         signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                //         raw: {
                //             data: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a',
                //             topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422']
                //         }
                //     },
                //     registrationBlock: {
                //         difficulty: '573135670',
                //         extraData: '0xdb830300018c4f70656e457468657265756d86312e34332e31826c69',
                //         gasLimit: 8000029,
                //         gasUsed: 92555,
                //         hash: '0x9963b732b160e47923d08c952dbf2c7cc41b0b63ed9fa24782f7728f7b0990ef',
                //         logsBloom: '0x00000000000000000000000000000080000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000200000000000000000000000000008000000000000000000000000080000000002000800000800100000000080000000000000000000000000000000001010000000000400204000000000000000000800000000000000000000000000000000000010020000000000000000000000004000000000000000000000000000000000000000000002000000000000000001000000000000000800000000000000000000000010000000000000000000000000000000000000000000000000000000000001',
                //         miner: '0x05FC5a079e0583B8A07526023A16E2022c4C6296',
                //         mixHash: '0xdd01d50de99e780528493537caf32498cd215e58cc78b6ae1c9ffc5467178eea',
                //         nonce: '0x12de0c2cb9d96b29',
                //         number: 9056995,
                //         parentHash: '0x28ade2ed29b955d7e6141f1842a78b023c965ccf918b7d5a09ebcc6f17b83546',
                //         receiptsRoot: '0xc628ffa7bfe4e2070fcfba6229be8375b02b375fa4a11d7112f0e9220ac2c657',
                //         sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                //         size: 1182,
                //         stateRoot: '0xcdc0253374c46dc462dcef2e472006cec28bf12c25472f77dee5acd25e80c523',
                //         timestamp: 1605206845,
                //         totalDifficulty: '32072960034439979',
                //         transactions: ['0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b', '0xdefc6ac46294b1efd08b4152d9143dc7fd63ff23c54b9445eada3e0009e1bff6'],
                //         transactionsRoot: '0xc95984a8b48a0d19987f524522dd9b17845b248ccafdc3ad153cf04beb6c934a',
                //         uncles: []
                //     },
                //     revocationEvent: null,
                //     revocationBlock: null,
                //     events: [{
                //         ref: 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         scope: 'register',
                //         date: '2020-11-12T18:47:25.000Z',
                //         expiry: null,
                //         issuer: 'Test',
                //         identityVerifier: null,
                //         transactionHash: '0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b'
                //     }],
                //     claims: [{
                //         '@context': 'https://schema.certifaction.io/claim/v2',
                //         '@id': 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         exp: { value: 0 },
                //         idclaims: [{
                //             '@context': 'https://schema.certifaction.io/idclaim/v1',
                //             '@id': 'cert:addr:0x9a1c785ef5f19c3cd6eb27b66cc318f2f425c5f6',
                //             name: 'Test',
                //             proof: {
                //                 creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                //                 nonce: 'AuUhT5zYzb6HD29ysGxqjC0BIKqZ9qTx',
                //                 signatureValue: '4965aec4458a8c73f0e8ffa0dde3ee80f3fe23aacdabd91258e18ced023ed70e1b1e966c02737fc75f51f47e1ca6b42c3535460834aaca4a480262d72696ab3000',
                //                 type: 'ECDSA'
                //             }
                //         }],
                //         proof: {
                //             creator: '0x9a1c785eF5F19C3Cd6eB27B66CC318f2F425c5f6',
                //             nonce: '8eRpTWs6md6FxsXX8YQ2KWdX5hqVm0b9',
                //             signatureValue: 'acaa996d24b6f2eddc7ef9b9c245dfb213dd419ae9d0a0249640582ab2df88a11ebe1ef24251f1507a8261a35926f81ba504dbe78d2e7faddd5450afc0963c7601',
                //             type: 'ECDSA'
                //         },
                //         scope: 'register'
                //     }],
                //     loaded: true
                // } // 3. normal
                // {
                //     hashed: true,
                //     type: 4,
                //     file: {},
                //     name: 'dummy (3).pdf',
                //     hash: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //     onBlockchain: true,
                //     issuerAddress: '0x9a1c785eF5F19C3Cd6eB27B66CC318f2F425c5f6',
                //     issuerName: 'Test',
                //     issuerImg: null,
                //     issuerVerified: false,
                //     issuerVerifiedBy: null,
                //     issuerVerifiedImg: null,
                //     revoked: true,
                //     expiry: null,
                //     registrationEvent: {
                //         address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                //         blockHash: '0x9963b732b160e47923d08c952dbf2c7cc41b0b63ed9fa24782f7728f7b0990ef',
                //         blockNumber: 9056995,
                //         logIndex: 0,
                //         removed: false,
                //         transactionHash: '0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b',
                //         transactionIndex: 0,
                //         id: 'log_9171fef1',
                //         returnValues: {
                //             0: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             1: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a',
                //             file: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             hash: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a'
                //         },
                //         event: 'Claim',
                //         signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                //         raw: {
                //             data: '0x5119f85b12b194480a6b8955c95c613b6b8f32bbdaa419246b1c829881b2310a',
                //             topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422']
                //         }
                //     },
                //     registrationBlock: {
                //         difficulty: '573135670',
                //         extraData: '0xdb830300018c4f70656e457468657265756d86312e34332e31826c69',
                //         gasLimit: 8000029,
                //         gasUsed: 92555,
                //         hash: '0x9963b732b160e47923d08c952dbf2c7cc41b0b63ed9fa24782f7728f7b0990ef',
                //         logsBloom: '0x00000000000000000000000000000080000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000200000000000000000000000000008000000000000000000000000080000000002000800000800100000000080000000000000000000000000000000001010000000000400204000000000000000000800000000000000000000000000000000000010020000000000000000000000004000000000000000000000000000000000000000000002000000000000000001000000000000000800000000000000000000000010000000000000000000000000000000000000000000000000000000000001',
                //         miner: '0x05FC5a079e0583B8A07526023A16E2022c4C6296',
                //         mixHash: '0xdd01d50de99e780528493537caf32498cd215e58cc78b6ae1c9ffc5467178eea',
                //         nonce: '0x12de0c2cb9d96b29',
                //         number: 9056995,
                //         parentHash: '0x28ade2ed29b955d7e6141f1842a78b023c965ccf918b7d5a09ebcc6f17b83546',
                //         receiptsRoot: '0xc628ffa7bfe4e2070fcfba6229be8375b02b375fa4a11d7112f0e9220ac2c657',
                //         sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                //         size: 1182,
                //         stateRoot: '0xcdc0253374c46dc462dcef2e472006cec28bf12c25472f77dee5acd25e80c523',
                //         timestamp: 1605206845,
                //         totalDifficulty: '32072960034439979',
                //         transactions: ['0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b', '0xdefc6ac46294b1efd08b4152d9143dc7fd63ff23c54b9445eada3e0009e1bff6'],
                //         transactionsRoot: '0xc95984a8b48a0d19987f524522dd9b17845b248ccafdc3ad153cf04beb6c934a',
                //         uncles: []
                //     },
                //     revocationEvent: {
                //         address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                //         blockHash: '0x7b264fc8050ebdc992daea902ddd4f6c24f2773f1eb761ad11f5ffdb1d4c796e',
                //         blockNumber: 9057027,
                //         logIndex: 1,
                //         removed: false,
                //         transactionHash: '0x54faaab44c62a1d75516694426c9d59ad05ad8d4ac36cab19cba1490b2360436',
                //         transactionIndex: 3,
                //         id: 'log_bd8ac7d7',
                //         returnValues: {
                //             0: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             1: '0xb96727311441caec64a454acc0cffb1cbf3770831fa07a5d2c43f6e92f07809f',
                //             file: '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //             hash: '0xb96727311441caec64a454acc0cffb1cbf3770831fa07a5d2c43f6e92f07809f'
                //         },
                //         event: 'Claim',
                //         signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                //         raw: {
                //             data: '0xb96727311441caec64a454acc0cffb1cbf3770831fa07a5d2c43f6e92f07809f',
                //             topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422']
                //         }
                //     },
                //     revocationBlock: {
                //         difficulty: '565891748',
                //         extraData: '0xdb830300018c4f70656e457468657265756d86312e34332e31826c69',
                //         gasLimit: 8000029,
                //         gasUsed: 182077,
                //         hash: '0x7b264fc8050ebdc992daea902ddd4f6c24f2773f1eb761ad11f5ffdb1d4c796e',
                //         logsBloom: '0x00000000000000000000000000000080000000000000000000000000000000000040000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000400000000000000000000000000000000000000000004000000000000000000800000800000000000000000000000000000010000000000000000020000000004000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000001000000000000000000000000000000000000000000000000000000001000000001',
                //         miner: '0x05FC5a079e0583B8A07526023A16E2022c4C6296',
                //         mixHash: '0x88dc85f499ab31d77e8c166190e20ba259e3865a9297ffd8491a44bb0cd125cf',
                //         nonce: '0x0d9bc0502588d9df',
                //         number: 9057027,
                //         parentHash: '0xb110dd5a631b5051668bdb06b9a37cbebd369db43efc4e96b2a837b69fb94a04',
                //         receiptsRoot: '0x955a65ac096052de159d69c440aacef5e5740254bd9ea41a32af2c7a02ab673e',
                //         sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                //         size: 1295,
                //         stateRoot: '0x331c38468b4a6e6346789ae4dbe93b539164e85361f3d25fb126696547311c7a',
                //         timestamp: 1605207505,
                //         totalDifficulty: '32072978196020912',
                //         transactions: ['0x8b9cc0f4727ceb0a680bd1763404e38ec4148e60ec265d9ec018e648412820cf', '0x494ac97c29a79a771160bb362dc742f0e664f995eaf71286e969dd780ed11aef', '0x30956fa5b386be608fb1717070b67f420b988241e6bd5268ee3fccc361c7160b', '0x54faaab44c62a1d75516694426c9d59ad05ad8d4ac36cab19cba1490b2360436'],
                //         transactionsRoot: '0x9c0a961511ce36085dda3794ae0e13f569a0c26305129d708dd6a0a7e6bae6e5',
                //         uncles: []
                //     },
                //     events: [{
                //         ref: 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         scope: 'register',
                //         date: '2020-11-12T18:47:25.000Z',
                //         expiry: null,
                //         issuer: 'Test',
                //         identityVerifier: null,
                //         transactionHash: '0x66d6a6dc8a705f816cb43e2e4b3d621093ab7dac453ce7270246ec1ff00c390b'
                //     }, {
                //         ref: 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         scope: 'revoke',
                //         date: '2020-11-12T18:58:25.000Z',
                //         expiry: null,
                //         issuer: 'Test',
                //         identityVerifier: null,
                //         transactionHash: '0x54faaab44c62a1d75516694426c9d59ad05ad8d4ac36cab19cba1490b2360436'
                //     }],
                //     claims: [{
                //         '@context': 'https://schema.certifaction.io/claim/v2',
                //         '@id': 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         exp: { value: 0 },
                //         idclaims: [{
                //             '@context': 'https://schema.certifaction.io/idclaim/v1',
                //             '@id': 'cert:addr:0x9a1c785ef5f19c3cd6eb27b66cc318f2f425c5f6',
                //             name: 'Test',
                //             proof: {
                //                 creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                //                 nonce: 'AuUhT5zYzb6HD29ysGxqjC0BIKqZ9qTx',
                //                 signatureValue: '4965aec4458a8c73f0e8ffa0dde3ee80f3fe23aacdabd91258e18ced023ed70e1b1e966c02737fc75f51f47e1ca6b42c3535460834aaca4a480262d72696ab3000',
                //                 type: 'ECDSA'
                //             }
                //         }],
                //         proof: {
                //             creator: '0x9a1c785eF5F19C3Cd6eB27B66CC318f2F425c5f6',
                //             nonce: '8eRpTWs6md6FxsXX8YQ2KWdX5hqVm0b9',
                //             signatureValue: 'acaa996d24b6f2eddc7ef9b9c245dfb213dd419ae9d0a0249640582ab2df88a11ebe1ef24251f1507a8261a35926f81ba504dbe78d2e7faddd5450afc0963c7601',
                //             type: 'ECDSA'
                //         },
                //         scope: 'register'
                //     }, {
                //         '@context': 'https://schema.certifaction.io/claim/v2',
                //         '@id': 'cert:hash:0xf5038e343c5f0dda75c9352117a43929344776964455674129abb503743b4422',
                //         exp: { value: 0 },
                //         idclaims: [{
                //             '@context': 'https://schema.certifaction.io/idclaim/v1',
                //             '@id': 'cert:addr:0x9a1c785ef5f19c3cd6eb27b66cc318f2f425c5f6',
                //             name: 'Test',
                //             proof: {
                //                 creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                //                 nonce: 'xktaVTSf5jBwvFDYfsAHYYgU8ykvOMYB',
                //                 signatureValue: 'f56f15a16c2a00b76a4e043b4dd8dbef0f7786add8736a0ebfa3615bb672f44a1720235bc835e03804398d607bd8ab41dd897ebae4ff46f57453944ccd6ec2a201',
                //                 type: 'ECDSA'
                //             }
                //         }],
                //         proof: {
                //             creator: '0x9a1c785eF5F19C3Cd6eB27B66CC318f2F425c5f6',
                //             nonce: 'FhjDghav68JBBIGivChaVNYpnXANitgK',
                //             signatureValue: '3a025793076384d74ca1fdfb91b95d1737faaf31a626539064bd71992cd391630f79d08f0882ad339538d03dccf5baff4aa3a721e9728a44537747921886a91c01',
                //             type: 'ECDSA'
                //         },
                //         scope: 'revoke'
                //     }],
                //     loaded: true
                // } // 5. normal revoked
                {
                    hashed: true,
                    type: 3,
                    file: {},
                    name: 'hin_dev_testnet_registering.pdf',
                    hash: '0x85a75d121df9bd922cb9ae18c327b264cdd4ef76d4867b257fd120efd60c3e99',
                    onBlockchain: false,
                    issuerName: 'Dr. Test Emeka Eric M. Mosanya',
                    issuerVerified: true,
                    issuerVerifiedBy: 'Health Info Net AG',
                    issuerVerifiedImg: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png',
                    status: 'registering',
                    revoked: false,
                    events: [{
                        scope: 'register',
                        issuer: 'Dr. Test Emeka Eric M. Mosanya',
                        identityVerifier: {
                            name: 'Health Info Net AG',
                            image: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png'
                        }
                    }],
                    loaded: true
                }, // hin registering
                {
                    hashed: true,
                    type: 4,
                    file: {},
                    name: 'hin_dev_testnet_121120201800.pdf',
                    hash: '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                    onBlockchain: true,
                    issuerAddress: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                    issuerName: 'Dr. Test Emeka Eric M. Mosanya',
                    issuerImg: null,
                    issuerVerified: false,
                    issuerVerifiedBy: 'Health Info Net AG',
                    issuerVerifiedImg: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png',
                    revoked: true,
                    expiry: null,
                    registrationEvent: {
                        address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                        blockHash: '0x752c4bfbeb0bfd766e09edeb647ceeea2868ed169abdc927ad7dc9bea94a5054',
                        blockNumber: 9056535,
                        logIndex: 2,
                        removed: false,
                        transactionHash: '0xe37f595be78401879a9225855c9bece4b1a72cc087112b65089f4ba92ea088f7',
                        transactionIndex: 8,
                        id: 'log_95c3fed9',
                        returnValues: {
                            0: '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                            1: '0x3719d4491ab44db3712b29f829867373d7cab736993faaed048c7e55a76efec6',
                            file: '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                            hash: '0x3719d4491ab44db3712b29f829867373d7cab736993faaed048c7e55a76efec6'
                        },
                        event: 'Claim',
                        signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                        raw: {
                            data: '0x3719d4491ab44db3712b29f829867373d7cab736993faaed048c7e55a76efec6',
                            topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1']
                        }
                    },
                    registrationBlock: {
                        difficulty: '604289890',
                        extraData: '0xdb830300018c4f70656e457468657265756d86312e34332e31826c69',
                        gasLimit: 8000029,
                        gasUsed: 2122193,
                        hash: '0x752c4bfbeb0bfd766e09edeb647ceeea2868ed169abdc927ad7dc9bea94a5054',
                        logsBloom: '0x00000000000000000000000000000080000000000000000000800000000800000040000000000000000000040000000000000000000200000000000004200000000000000000000000000008000000002001000000000000080000000002000800000800020000000080000000400800000000000000000000001010000000400000001000020000000000000800000800000000000010000000000000000000020000000000000020000000000000000000000000000000000000000001000000000002000004000000000001000000000000008800000000000000000021000010040000000000000000000000000000000000000000000000011000000001',
                        miner: '0x05FC5a079e0583B8A07526023A16E2022c4C6296',
                        mixHash: '0xfd7ed081edd6924f235b3beefcce3fa13c34ada76cc66f16bc44fea071a6ffa2',
                        nonce: '0x3d71744ac9976e5d',
                        number: 9056535,
                        parentHash: '0x493368f7af297fa0a45af53b4ea38c8d616f61f2bfd94a8af6b1441f69c4069d',
                        receiptsRoot: '0xe634ee42c7b051eae97c03a1ad6cc730fb82edf26d699674011779557a0fe3df',
                        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                        size: 9851,
                        stateRoot: '0xf0a9095e08a956f76812caa27f975fc0b952549306f1438f2a0135286d004cc5',
                        timestamp: 1605199582,
                        totalDifficulty: '32072693417494041',
                        transactions: ['0x73f4f916a98c61ec800f5b634a4744454b7e7cbc2e18ece8324f1f2bcedfb988', '0x69949b76f03bd3261cfe5ad406f886f62a279a919a725299d29f5af9bab4e259', '0x0a259d5f3df9073cf6cbff5aec94f1413ed68b68e49653aec354a083ff6cc4a7', '0x94900c810b353a72a06e77047be8b1621109df5f3006bfecb8277c4657520561', '0xc36c49eee320b8b48b6ca1d276e3735c73c5c14ec264557f31a29fa4a69a5d09', '0xeef5af2b08ea3086c94ade025fe993db62c0b7cf5e8bfb82d8e577cb37845b09', '0x0e88fe66ad7f3d12d208fa3ba87a0aa936e073b834fd1cc1a86c38739719501f', '0xa5c911d26000134aeef80d7b2c40de93b9c0a78b273b8806db7381a0138d68cc', '0xe37f595be78401879a9225855c9bece4b1a72cc087112b65089f4ba92ea088f7', '0xc73dff50ecc19964b3ea4a08f2a30b7286a7138b5df7e25754bfc1741cd6ea88'],
                        transactionsRoot: '0xe66eb2f384c3779c5b9a2fa6edce4a05b4031fd3858bfbe350dbf24f9dfcce30',
                        uncles: []
                    },
                    revocationEvent: {
                        address: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                        blockHash: '0x6e51bde1aef7559f2bea1dc67d724b934e93a0c8cf9f81d61554b3e03886cd5a',
                        blockNumber: 9057703,
                        logIndex: 7,
                        removed: false,
                        transactionHash: '0x514cf994fc115eac5fdf0bc61c4e901dbfd4d4f2638ea47eb878567966491e97',
                        transactionIndex: 7,
                        id: 'log_14d659ab',
                        returnValues: {
                            0: '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                            1: '0x1eeb74e0cb99a7d3c05f7568222879679165cfe72d9e064d87ba7f31e7713017',
                            file: '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                            hash: '0x1eeb74e0cb99a7d3c05f7568222879679165cfe72d9e064d87ba7f31e7713017'
                        },
                        event: 'Claim',
                        signature: '0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137',
                        raw: {
                            data: '0x1eeb74e0cb99a7d3c05f7568222879679165cfe72d9e064d87ba7f31e7713017',
                            topics: ['0x5664142af3dcfc3dc3de45a43f75c746bd1d8c11170a5037fdf98bdb35775137', '0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1']
                        }
                    },
                    revocationBlock: {
                        difficulty: '576116768',
                        extraData: '0xdb830300018c4f70656e457468657265756d86312e34332e31826c69',
                        gasLimit: 8000029,
                        gasUsed: 3789149,
                        hash: '0x6e51bde1aef7559f2bea1dc67d724b934e93a0c8cf9f81d61554b3e03886cd5a',
                        logsBloom: '0x0020000000000000000000008000008000000000400000000001000000080000604000000000000000000000000000000000000000000000000000000020000004000000000000000000000800040020000020000040000000000000000000080000000000000000000000000000000010000000000004000000001000000000000000000000020000c000000800000000000000200010080000004040000000120000100000000000000000000000000000000000000000000000000000000000000002000001000000008000000000000000000800001000000002000020000030000020000000000000000000000000002000000000000000010000000001',
                        miner: '0x05FC5a079e0583B8A07526023A16E2022c4C6296',
                        mixHash: '0xcd9558ab46113fb98406a9c542aeb54bd920fec71b8b3256f46e48d1630f812d',
                        nonce: '0xcc02249b594ad530',
                        number: 9057703,
                        parentHash: '0x4725708056dd20e11d5f6c7fb06daa9c748e43624b39cbb7f190c03ae506a46a',
                        receiptsRoot: '0xdd8603c682143e55ad7705cf6266684ad879e6283dbf7edf0260bdeac5980ac1',
                        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
                        size: 17821,
                        stateRoot: '0x333cf8fc40aa1ae43e8004eda92bac32949143f69a87701de7b5e119ead1a61c',
                        timestamp: 1605216297,
                        totalDifficulty: '32073365438182129',
                        transactions: ['0x7961123d1d3863a8bd721978f96c56feccc33d064eef1c3c757e7f16f6a7827d', '0x9d605d8ed9a669cb5117288e4e18a9d1f6915638d549d8dc144259a99e3ac13a', '0xbe3d10ecd755aab69acdf9007e2b2c1c2bc21d11ba2aa4fa07ffaf20ae8d4262', '0x50ff02067032b386a6ec40336498177ec64dcd5e7fc49d28e4159032eaaf75da', '0x9a10c61c770444a6681699ea4a230ad44c80faebab34573f73a6995c0cb784ab', '0x9fec40e2ede1c2e6072fbfa2a4ba26dae83b6831b073c7bb65093a114c016071', '0x258f074e5a8e390cd394309fb1d32ef2c755e66910b076f6b32587eb71832ee0', '0x514cf994fc115eac5fdf0bc61c4e901dbfd4d4f2638ea47eb878567966491e97'],
                        transactionsRoot: '0x8018ec557938d39e8ef2418ab5cf3005d4a4df67e6fc0fd5fb8736556fc22044',
                        uncles: []
                    },
                    events: [{
                        ref: 'cert:hash:0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                        scope: 'sign',
                        date: '2020-11-12T16:46:22.000Z',
                        expiry: null,
                        issuer: 'Dr. Test Emeka Eric M. Mosanya',
                        identityVerifier: {
                            name: 'Health Info Net AG',
                            image: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png'
                        },
                        issuerAddress: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                        smartContractAddress: '0xe24A7F24954a68B0f9B0862cFF83b817D9f63409',
                        transactionHash: '0xe37f595be78401879a9225855c9bece4b1a72cc087112b65089f4ba92ea088f7'
                    }, {
                        ref: 'cert:hash:0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                        scope: 'revoke',
                        date: '2020-11-12T21:24:57.000Z',
                        expiry: null,
                        issuer: 'Dr. Test Emeka Eric M. Mosanya',
                        identityVerifier: {
                            name: 'Health Info Net AG',
                            image: 'https://app.dev.testnet.certifaction.io/images/verified_by_hin.png'
                        },
                        transactionHash: '0x514cf994fc115eac5fdf0bc61c4e901dbfd4d4f2638ea47eb878567966491e97'
                    }],
                    claims: [{
                        '@context': 'https://schema.certifaction.io/claim/v2',
                        '@id': 'cert:hash:0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                        exp: { value: 0 },
                        idclaims: [{
                            '@context': 'https://schema.certifaction.io/idclaim/v1',
                            '@id': 'cert:addr:0xf33dcb8d760c9b6103b28bc7dde84c44edfe3631',
                            name: 'Dr. Test Emeka Eric M. Mosanya',
                            proof: {
                                creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                                nonce: 'kfDRTrB4ekTtITjjrNTpWtlW8raNkT3k',
                                signatureValue: 'ccf672049c73453672dcf39f376ff84d42d19c585d330c52862bb5f8a85c9f3d2c82df1909deccf9917bdf95dafaa998220a01a0f0be28f7e44a0a67b6b55e5600',
                                type: 'ECDSA'
                            },
                            verifiedBy: 'HIN'
                        }],
                        proof: {
                            creator: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                            nonce: 'koXCwaPXf61UMe8d6i6fmkhxa485l3FD',
                            signatureValue: '015aca55f36ebdf7913632bb0e0b0e4c701db6f1e7d569e541057e28fc679b6e30ae963c44173fc0d36af008719ceced2373d418f3069459016ec0c16352aa1a00',
                            type: 'ECDSA'
                        },
                        scope: 'sign'
                    }, {
                        '@context': 'https://schema.certifaction.io/claim/v2',
                        '@id': 'cert:hash:0xb4f2b940d8a4e5fda488c4661faff435a075b8a2f3f62f68b32c3499765679e1',
                        exp: { value: 0 },
                        idclaims: [{
                            '@context': 'https://schema.certifaction.io/idclaim/v1',
                            '@id': 'cert:addr:0xf33dcb8d760c9b6103b28bc7dde84c44edfe3631',
                            name: 'Dr. Test Emeka Eric M. Mosanya',
                            proof: {
                                creator: '0x57f7c7f877eE998ACC1b92417EBc7DF29fF77E3F',
                                nonce: 'ZH5k36hm6E9rNIF6daFypndHjaQHQVcc',
                                signatureValue: '5a8f8dee71d133e1ee243acb0154b25d92336e73144be785fd2fc0c803ba90df18aee1416c65e7586622d338d1e97b8434098df1ee7bdd4fbc2d166e15b86f4601',
                                type: 'ECDSA'
                            },
                            verifiedBy: 'HIN'
                        }],
                        proof: {
                            creator: '0xf33Dcb8D760c9b6103b28bC7DDe84c44eDfE3631',
                            nonce: 'Mev7mj45hndvKfz3IQ5Bvlk5HaDZ3TtF',
                            signatureValue: '74051ca454ff788f3e2ae5e419cf32a1af527ca789e2b2954c676e922f188c02681882a9f9bfc2fd16b91e76c89ee439cf2c271dafa77959b4b4eb159f7ed63f00',
                            type: 'ECDSA'
                        },
                        scope: 'revoke'
                    }],
                    loaded: true
                } // hin revoked
            ]
        }
    },
    computed: {
        filteredVerificationItems() {
            return this.verificationItems.map(item => {
                if (item.hash === undefined && !item.error) {
                    return {
                        hashed: false
                    }
                }
                return {
                    hashed: true,
                    type: mapVerificationItemType(item),
                    ...item
                }
            })
        }
    },
    methods: {
        async verify(files) {
            this.verificationItems = []
            try {
                for (const file of files) {
                    this.verificationItems.push({ file, name: file.name })
                }

                for (const [key, item] of this.verificationItems.entries()) {
                    this.verifyItem(item, key)
                }

                await this.$nextTick()

                VueScrollTo.scrollTo(this.$refs.results, 400)
            } catch (e) {
                console.log(e)
            }
        },
        async verifyItem(item, key) {
            let verification = {}

            try {
                const hash = await hashingService.hashFile(item.file)
                verification = await this.certifactionEthVerifier.verify(hash)

                Vue.set(this.verificationItems, key, { ...item, ...verification })

                if (this.offchainVerifier) {
                    verification = await this.offchainVerification(item, verification)
                }
            } catch (e) {
                console.log('An error occurred during hashing & retrieval of information', e)
                verification.error = e
            } finally {
                verification.loaded = true
            }

            Vue.set(this.verificationItems, key, { ...item, ...verification })
        },
        async offchainVerification(item, verification) {
            // Make a call to the off-chain validator
            try {
                const offchainVerification = await this.offchainVerifier.verify(verification.hash)

                if (offchainVerification) {
                    if (!verification.issuerAddress && offchainVerification.status === 'registering') {
                        // File not found on blockchain and offchain status is registering
                        verification = {
                            ...verification,
                            ...offchainVerification
                        }
                    } else if (
                        !verification.issuerName &&
                        offchainVerification.issuerName &&
                        ['registered', 'registering', 'revoking', 'revoked'].indexOf(offchainVerification.status) >= 0
                    ) {
                        // If it's already verified on blockchain, do not override all values;
                        // just issuerName & issuer verifier can be taken from off-chain information
                        verification.issuerName = offchainVerification.issuerName
                        verification.issuerVerified = offchainVerification.issuerVerified
                        verification.issuerVerifiedBy = offchainVerification.issuerVerifiedBy
                        verification.issuerVerifiedImg = offchainVerification.issuerVerifiedImg
                    }
                }
            } catch (e) {
                verification.offchainError = true
            }

            return verification
        },
        onDraggingDemoDoc(demoDoc) {
            this.draggingDemoDoc = demoDoc
        },
        drop() {
            if (this.draggingDemoDoc) {
                this.verifyDemo(this.draggingDemoDoc)
            }
        },
        async verifyDemo(type) {
            if (demoDocuments[type]) {
                this.verificationItems = [demoDocuments[type]]
                await this.$nextTick()
                VueScrollTo.scrollTo(this.$refs.results, 400)
            }
        },
        async verifyDemoFile() {
            this.verificationItems = this.demoFiles
            await this.$nextTick()
        },
        handleDrop(e) {
            this.dropbox.draggingOver = false
            this.verify(e.dataTransfer.files)
        },
        async dragOver() {
            if (!this.dropbox.draggingOver) {
                this.dropbox.draggingOver = true
                this.dropbox.dragLeaveLocked = true

                setTimeout(() => {
                    this.dropbox.dragLeaveLocked = false
                }, 100)
            }
        },
        dragLeave() {
            if (!this.dropbox.dragLeaveLocked) {
                this.dropbox.draggingOver = false
            }
        }
    }
}
</script>
