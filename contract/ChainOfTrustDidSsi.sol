// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19 <0.9.0;

struct DidDocumentData {
    bool reified;
    bool deactivated;
    uint64 creationTimestamp;
    uint64 lastUpdateTimestamp;
    uint authenticationsCount;
    TrustCertification trustCertification;
    mapping(string => VerificationMethod) verificationMethods;
    mapping(string => Service) services;
    mapping(string => bool) revokedCredentials;
    string[] verificationMethodMapKeys;
    string[] serviceMapKeys;
    string[] revokedCredentialsMapKeys;
}

struct TrustCertification {
    bool valid;
    uint64 issuanceTimestamp;
    uint64 expirationTimestamp;
    string issuer;
    string credentialStatusFragment;
    EcdsaSecp256k1Proof proof;
}

struct EcdsaSecp256k1Proof {
    bytes32 jwsSignatureR;
    bytes32 jwsSignatureS;
    uint8 jwsSignatureV;
    uint64 createdTimestamp;
    string issuerAssertionMethodFragment;
}

struct VerificationMethod {
    bool valid;
    address blockchainAccount;
    VerificationMethodType methodType;
    uint keyIndex;
    string didUrlFragment;
}

enum VerificationMethodType {
    Authentication,
    AssertionMethod
}

struct Service {
    bool valid;
    uint keyIndex;
    string didUrlFragment;
    string serviceType;
    string endpoint;
}

struct CertificationCredential {
    string issuer;
    uint issuanceTimestamp;
    uint expirationTimestamp;
    string credentialStatusFragment;
    EcdsaSecp256k1Proof proof;
}

enum TrustCertificationStatus {
    Valid,
    Deactivated,
    Revoked
}

struct ResolvedDidDocument {
    bool valid;
    bool deactivated;
    uint createdTimestamp;
    uint updatedTimestamp;
    VerificationMethod[] verificationMethods;
    Service[] services;
    TrustCertification certification;
    TrustCertificationStatus certificationStatus;
}

struct ResolvedTrustChain {
    TrustCertification[] certifications;
    TrustCertificationStatus[] statuses;
}

error InvalidDidUrl(string);
error DidDocumentNotFound(string);
error DidUrlResourceNotFound(string);
error InvalidProofSignature(string);
error InvalidIssuer(string);
error InvalidIssuanceDate(string);
error ExpiredCredential(string);
error RevokedCredential(string);
error DeactivatedDocument(string);
error AuthenticationError(string);
error DuplicatedResource(string);
error LastAuthentication(string);
error InvalidHexDigit(string);

contract ChainOfTrustDidSsi {
    uint private immutable didSchemaLength;
    bytes32 private didSchema;
    mapping(string => DidDocumentData) private didDocuments;
    // Development-only
    string[] private didDocumentsMapKeys;

    constructor() {
        bytes memory schema = bytes.concat("did:ssi-cot-eth:", uintToBytes(block.chainid), ":");
        if (schema.length > 32) {
            revert("Schema error");
        }
        didSchema = bytes32(schema);
        didSchemaLength = schema.length;
    }

    function updateTrustCertification(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        CertificationCredential calldata certificationCredential
    ) public {
        /*
        Assumptions:
        - The 4 contexts are all present
            => If not, the JWS will be invalid
        - The type must be ["VerifiableCredential", "CertificationCredential"]
            => If not, the JWS will be invalid
        - The credentialStatus.type is "RevocationList2023"
            => If not, the JWS will be invalid
        - The proof.type is "EcdsaSecp256k1RecoverySignature2020"
            => If not, the JWS may be invalid
        - The proof.created is ignored
        - The proof.proofPurpose is "assertionMethod"
            => If not, no assertion method will be retrieved from the DID document of the issuer
        - DID URLs must be absolute
            => If not, nothing works
        */
        // Verify the correctness of the credential
        verifyCertificationCredential(certificationCredential);

        // Authenticate the sender
        DidDocumentData storage senderDidDocument = authenticateSender(
            senderAuthDid,
            senderAuthFragment
        );

        // proof.verificationMethod is a valid assertion method
        VerificationMethod memory issuerAssertionMethod = resolveVerificationMethod(
            certificationCredential.issuer,
            certificationCredential.proof.issuerAssertionMethodFragment
        );
        if (
            !issuerAssertionMethod.valid ||
            issuerAssertionMethod.methodType != VerificationMethodType.AssertionMethod
        ) {
            revert InvalidDidUrl("Invalid proof verification method");
        }

        TrustCertification memory trustCertification = TrustCertification(
            true,
            uint64(certificationCredential.issuanceTimestamp),
            uint64(certificationCredential.expirationTimestamp),
            certificationCredential.issuer,
            certificationCredential.credentialStatusFragment,
            certificationCredential.proof
        );

        // Verify the signature
        address signer = getSignatureSigner(senderAuthDid, trustCertification);
        if (signer != issuerAssertionMethod.blockchainAccount) {
            revert InvalidProofSignature("Invalid signature");
        }

        // Reify the DID document, if needed
        reifyOrUpdateDidDocument(senderDidDocument, senderAuthDid);
        // Add the chain information
        senderDidDocument.trustCertification = trustCertification;
    }

    function removeTrustCertification(
        string calldata senderAuthDid,
        string calldata senderAuthFragment
    ) public {
        // Authenticate the user
        DidDocumentData storage userDidDocument = authenticateSender(
            senderAuthDid,
            senderAuthFragment
        );

        // Remove the certification
        if (userDidDocument.reified) {
            userDidDocument.lastUpdateTimestamp = uint64(block.timestamp);
            delete userDidDocument.trustCertification;
        }
    }

    function addVerificationMethod(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        VerificationMethodType methodType,
        string memory methodDidUrlFragment,
        address blockchainAccount
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        // Reify the document if needed
        reifyOrUpdateDidDocument(didDocument, senderAuthDid);

        // Check for duplicates
        if (
            didDocument.verificationMethods[methodDidUrlFragment].valid ||
            didDocument.services[methodDidUrlFragment].valid
        ) {
            revert DuplicatedResource("DID URL already present");
        }

        VerificationMethod memory verificationMethod = VerificationMethod(
            true,
            blockchainAccount,
            methodType,
            didDocument.verificationMethodMapKeys.length,
            methodDidUrlFragment
        );

        // Add the verification method
        didDocument.verificationMethods[methodDidUrlFragment] = verificationMethod;
        didDocument.verificationMethodMapKeys.push(methodDidUrlFragment);
    }

    function addService(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string calldata serviceDidUrlFragment,
        string memory serviceType,
        string memory endpoint
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        // Reify the document if needed
        reifyOrUpdateDidDocument(didDocument, senderAuthDid);

        // Check if it exists
        if (
            didDocument.verificationMethods[serviceDidUrlFragment].valid ||
            didDocument.services[serviceDidUrlFragment].valid
        ) {
            revert DuplicatedResource("DID URL already present");
        }

        // Add the service
        didDocument.services[serviceDidUrlFragment] = Service(
            true,
            didDocument.serviceMapKeys.length,
            serviceDidUrlFragment,
            serviceType,
            endpoint
        );
        didDocument.serviceMapKeys.push(serviceDidUrlFragment);
    }

    function updateVerificationMethod(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string memory verificationMethodFragment,
        VerificationMethodType methodType,
        address blockchainAccount
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        VerificationMethod storage methodToUpdate = didDocument.verificationMethods[
            verificationMethodFragment
        ];
        if (!methodToUpdate.valid || methodToUpdate.methodType != methodType) {
            revert DidUrlResourceNotFound("Verification method not found");
        }

        // Update the method
        methodToUpdate.blockchainAccount = blockchainAccount;
        didDocument.lastUpdateTimestamp = uint64(block.timestamp);
    }

    function updateService(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string calldata serviceDidUrlFragment,
        string memory serviceType,
        string memory endpoint
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        Service storage serviceToUpdate = didDocument.services[serviceDidUrlFragment];
        if (!serviceToUpdate.valid) {
            revert DidUrlResourceNotFound("Service not found");
        }

        serviceToUpdate.serviceType = serviceType;
        serviceToUpdate.endpoint = endpoint;
        didDocument.lastUpdateTimestamp = uint64(block.timestamp);
    }

    function removeVerificationMethod(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string memory verificationMethodFragment,
        VerificationMethodType methodType
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        // Retrieve the verification method to delete
        VerificationMethod storage methodToDelete = didDocument.verificationMethods[
            verificationMethodFragment
        ];
        if (!methodToDelete.valid || methodToDelete.methodType != methodType) {
            revert DidUrlResourceNotFound("Verification method not found");
        }

        // Disallow removing the last authentication method
        if (methodType == VerificationMethodType.Authentication) {
            if (didDocument.authenticationsCount == 1) {
                revert LastAuthentication("Last authentication method");
            }
            didDocument.authenticationsCount--;
        }

        // Remove the verification method from the keys
        uint keyIndex = methodToDelete.keyIndex;
        string memory lastKey = didDocument.verificationMethodMapKeys[
            didDocument.verificationMethodMapKeys.length - 1
        ];
        didDocument.verificationMethodMapKeys[keyIndex] = lastKey;
        didDocument.verificationMethodMapKeys.pop();
        VerificationMethod storage lastVerificationMethod = didDocument.verificationMethods[
            lastKey
        ];
        lastVerificationMethod.keyIndex = keyIndex;

        // Remove the authentication from the map
        delete didDocument.verificationMethods[verificationMethodFragment];
        didDocument.lastUpdateTimestamp = uint64(block.timestamp);
    }

    function removeService(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string calldata serviceDidUrlFragment
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        // Retrieve the service to delete
        Service storage serviceToDelete = didDocument.services[serviceDidUrlFragment];
        if (!serviceToDelete.valid) {
            revert DidUrlResourceNotFound("Service not found");
        }

        // Remove the service from the keys
        uint keyIndex = serviceToDelete.keyIndex;
        string memory lastKey = didDocument.serviceMapKeys[didDocument.serviceMapKeys.length - 1];

        didDocument.serviceMapKeys[keyIndex] = lastKey;
        didDocument.serviceMapKeys.pop();
        Service storage lastService = didDocument.services[lastKey];
        lastService.keyIndex = keyIndex;

        // Remove the service from the map
        delete didDocument.services[serviceDidUrlFragment];
        didDocument.lastUpdateTimestamp = uint64(block.timestamp);
    }

    function revokeVerifiableCredential(
        string calldata senderAuthDid,
        string calldata senderAuthFragment,
        string memory credentialStatusFragment
    ) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        reifyOrUpdateDidDocument(didDocument, senderAuthDid);

        if (didDocument.revokedCredentials[credentialStatusFragment]) {
            revert RevokedCredential("Credential already revoked");
        }

        didDocument.revokedCredentials[credentialStatusFragment] = true;
        didDocument.revokedCredentialsMapKeys.push(credentialStatusFragment);
    }

    function deactivate(string calldata senderAuthDid, string calldata senderAuthFragment) public {
        // Authenticate the sender
        DidDocumentData storage didDocument = authenticateSender(senderAuthDid, senderAuthFragment);

        // Reify the document if needed
        reifyOrUpdateDidDocument(didDocument, senderAuthDid);

        didDocument.deactivated = true;
    }

    function resolve(string memory did) public view returns (ResolvedDidDocument memory) {
        DidDocumentData storage didDocument = didDocuments[did];

        VerificationMethod[] memory verificationMethods = new VerificationMethod[](
            didDocument.verificationMethodMapKeys.length
        );
        for (uint i = 0; i < verificationMethods.length; i++) {
            verificationMethods[i] = didDocument.verificationMethods[
                didDocument.verificationMethodMapKeys[i]
            ];
        }

        Service[] memory services = new Service[](didDocument.serviceMapKeys.length);
        for (uint i = 0; i < services.length; i++) {
            services[i] = didDocument.services[didDocument.serviceMapKeys[i]];
        }

        return
            ResolvedDidDocument(
                didDocument.reified,
                didDocument.deactivated,
                didDocument.creationTimestamp,
                didDocument.lastUpdateTimestamp,
                verificationMethods,
                services,
                didDocument.trustCertification,
                getCertificationStatus(
                    didDocument.trustCertification.credentialStatusFragment,
                    didDocuments[didDocument.trustCertification.issuer]
                )
            );
    }

    function resolveChain(string memory did) public view returns (ResolvedTrustChain memory) {
        TrustCertification[] memory certifications = new TrustCertification[](10);
        TrustCertificationStatus[] memory statuses = new TrustCertificationStatus[](10);

        TrustCertification memory currentCertification = didDocuments[did].trustCertification;
        uint8 index = 0;

        while (currentCertification.valid) {
            DidDocumentData storage issuerDocument = didDocuments[currentCertification.issuer];
            certifications[index] = currentCertification;
            statuses[index] = getCertificationStatus(
                currentCertification.credentialStatusFragment,
                issuerDocument
            );

            // Move to parent
            currentCertification = issuerDocument.trustCertification;
            index++;
        }

        return ResolvedTrustChain(certifications, statuses);
    }

    function resolveVerificationMethod(
        string calldata methodDid,
        string calldata methodDidUrlFragment
    ) public view returns (VerificationMethod memory) {
        VerificationMethod memory verificationMethod;
        DidDocumentData storage didDocument = didDocuments[methodDid];

        if (didDocument.reified) {
            verificationMethod = didDocument.verificationMethods[methodDidUrlFragment];
        } else {
            if (!isValidDid(methodDid)) {
                revert InvalidDidUrl("Invalid DID URL verification method");
            }
            // Create the verification method on the fly
            bytes memory fragmentBytes = bytes(methodDidUrlFragment);
            bool isAuthentication = bytes10(fragmentBytes) == "auth-key-1";
            if (
                (fragmentBytes.length == 10 && isAuthentication) ||
                (fragmentBytes.length == 12 && bytes12(fragmentBytes) == "assert-key-1")
            ) {
                address userAddress = address(didToAddress(methodDid));
                VerificationMethodType methodType = (isAuthentication)
                    ? VerificationMethodType.Authentication
                    : VerificationMethodType.AssertionMethod;
                verificationMethod = createFirstVerificationMethod(userAddress, methodType);
            } else {
                verificationMethod = VerificationMethod(
                    false,
                    address(0),
                    VerificationMethodType.Authentication,
                    0,
                    ""
                );
            }
        }

        return verificationMethod;
    }

    function resolveService(
        string calldata serviceDid,
        string calldata serviceFragment
    ) public view returns (Service memory) {
        DidDocumentData storage didDocument = didDocuments[serviceDid];

        if (!didDocument.reified) {
            revert DidUrlResourceNotFound("Service not found");
        }
        Service memory service = didDocument.services[serviceFragment];
        if (!service.valid) {
            revert DidUrlResourceNotFound("Service not found");
        }

        return service;
    }

    function resolveCredentialStatus(
        string calldata credentialDid,
        string calldata credentialFragment
    ) public view returns (bool) {
        if (!isValidDid(credentialDid)) {
            revert InvalidDidUrl("Invalid credential DID");
        }

        DidDocumentData storage didDocument = didDocuments[credentialDid];

        return didDocument.revokedCredentials[credentialFragment];
    }

    function clear() public {
        uint documentsCount = didDocumentsMapKeys.length;

        while (documentsCount > 0) {
            DidDocumentData storage didDocument = didDocuments[
                didDocumentsMapKeys[documentsCount - 1]
            ];

            // Delete verification methods
            uint verificationMethodsCount = didDocument.verificationMethodMapKeys.length;
            while (verificationMethodsCount > 0) {
                string memory key = didDocument.verificationMethodMapKeys[
                    verificationMethodsCount - 1
                ];
                delete didDocument.verificationMethods[key];
                didDocument.verificationMethodMapKeys.pop();
                verificationMethodsCount--;
            }

            // Delete services
            uint servicesCount = didDocument.serviceMapKeys.length;
            while (servicesCount > 0) {
                string memory key = didDocument.serviceMapKeys[servicesCount - 1];
                delete didDocument.services[key];
                didDocument.serviceMapKeys.pop();
                servicesCount--;
            }

            // Delete revoked certifications
            uint revokedCertificationsCount = didDocument.revokedCredentialsMapKeys.length;
            while (revokedCertificationsCount > 0) {
                string memory key = didDocument.revokedCredentialsMapKeys[
                    revokedCertificationsCount - 1
                ];
                delete didDocument.revokedCredentials[key];
                didDocument.revokedCredentialsMapKeys.pop();
                revokedCertificationsCount--;
            }

            delete didDocuments[didDocumentsMapKeys[documentsCount - 1]];
            didDocumentsMapKeys.pop();
            documentsCount--;
        }
    }

    function verifyCertificationCredential(
        CertificationCredential calldata certificationCredential
    ) private view {
        string calldata issuer = certificationCredential.issuer;

        // issuer must be a valid DID
        if (!isValidDid(issuer)) {
            revert InvalidIssuer("Invalid credential issuer DID");
        }
        // issuanceDate <= now()
        if (certificationCredential.issuanceTimestamp > block.timestamp) {
            revert InvalidIssuanceDate("Invalid credential issuance date");
        }
        // expirationData >= now()
        if (certificationCredential.expirationTimestamp < block.timestamp) {
            revert ExpiredCredential("The credential is expired");
        }
        // The credential must not be revoked
        if (
            didDocuments[issuer].revokedCredentials[
                certificationCredential.credentialStatusFragment
            ]
        ) {
            revert RevokedCredential("Revoked credential");
        }
    }

    function authenticateSender(
        string calldata senderAuthDid,
        string calldata senderAuthFragment
    ) private view returns (DidDocumentData storage) {
        // senderAuthDid must be a valid DID
        if (!isValidDid(senderAuthDid)) {
            revert InvalidDidUrl("Authentication DID not valid");
        }

        // The DID document of the user must not be deactivated
        DidDocumentData storage senderDidDocument = didDocuments[senderAuthDid];
        if (senderDidDocument.deactivated) {
            revert DeactivatedDocument("DID deactivated");
        }

        // Authenticate the sender of the transaction
        bool authenticated;
        if (senderDidDocument.reified) {
            // Resolve the authentication method
            VerificationMethod memory authMethod = senderDidDocument.verificationMethods[
                senderAuthFragment
            ];
            authenticated =
                authMethod.valid &&
                authMethod.methodType == VerificationMethodType.Authentication &&
                authMethod.blockchainAccount == msg.sender;
        } else {
            authenticated = address(didToAddress(senderAuthDid)) == msg.sender;
        }

        if (!authenticated) {
            revert AuthenticationError("Authentication error");
        }

        return senderDidDocument;
    }

    function getSignatureSigner(
        string memory userDid,
        TrustCertification memory certification
    ) private pure returns (address) {
        // Compute the hash of the JWS payload
        string memory payload = string.concat(
            "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19.<",
            //
            certification.issuer,
            "#",
            certification.credentialStatusFragment,
            "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://www.ssicot.com/RevocationList2023/#> .\n",
            //
            "_:c14n0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://www.ssicot.com/credentials/#CertificationCredential> .\n",
            //
            "_:c14n0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://www.w3.org/2018/credentials#VerifiableCredential> .\n",
            //
            "_:c14n0 <https://www.w3.org/2018/credentials#credentialStatus> <",
            certification.issuer,
            "#",
            certification.credentialStatusFragment,
            "> .\n",
            //
            "_:c14n0 <https://www.w3.org/2018/credentials#credentialSubject> <",
            userDid,
            "> .\n",
            //
            '_:c14n0 <https://www.w3.org/2018/credentials#expirationDate> "',
            timestampToIsoDate(certification.expirationTimestamp),
            '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n',
            //
            '_:c14n0 <https://www.w3.org/2018/credentials#issuanceDate> "',
            timestampToIsoDate(certification.issuanceTimestamp),
            '"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n',
            //
            "_:c14n0 <https://www.w3.org/2018/credentials#issuer> <",
            certification.issuer,
            "> .\n"
        );
        bytes32 hash = sha256(bytes(payload));

        EcdsaSecp256k1Proof memory proof = certification.proof;

        return ecrecover(hash, proof.jwsSignatureV, proof.jwsSignatureR, proof.jwsSignatureS);
    }

    function reifyOrUpdateDidDocument(
        DidDocumentData storage didDocument,
        string memory userDid
    ) private {
        // Reify the DID document, if needed
        if (!didDocument.reified) {
            initializeDidDocument(didDocument, userDid);
        } else {
            didDocument.lastUpdateTimestamp = uint64(block.timestamp);
        }
    }

    function initializeDidDocument(
        DidDocumentData storage didDocument,
        string memory userDid
    ) private {
        VerificationMethod memory authentication = createFirstVerificationMethod(
            msg.sender,
            VerificationMethodType.Authentication
        );
        VerificationMethod memory assertionMethod = createFirstVerificationMethod(
            msg.sender,
            VerificationMethodType.AssertionMethod
        );

        didDocument.reified = true;
        didDocument.deactivated = false;
        didDocument.creationTimestamp = uint64(block.timestamp);
        didDocument.lastUpdateTimestamp = uint64(block.timestamp);
        didDocument.verificationMethods["auth-key-1"] = authentication;
        didDocument.verificationMethods["assert-key-1"] = assertionMethod;
        didDocument.verificationMethodMapKeys.push("auth-key-1");
        didDocument.verificationMethodMapKeys.push("assert-key-1");
        didDocument.authenticationsCount = 1;

        // Development-only
        didDocumentsMapKeys.push(userDid);
    }

    function createFirstVerificationMethod(
        address userAddress,
        VerificationMethodType methodType
    ) private pure returns (VerificationMethod memory) {
        return
            VerificationMethod(
                true,
                userAddress,
                methodType,
                0,
                (methodType == VerificationMethodType.Authentication)
                    ? "auth-key-1"
                    : "assert-key-1"
            );
    }

    function getCertificationStatus(
        string memory credentialStatusFragment,
        DidDocumentData storage issuerDocument
    ) private view returns (TrustCertificationStatus) {
        if (issuerDocument.deactivated) {
            return TrustCertificationStatus.Deactivated;
        }
        if (issuerDocument.revokedCredentials[credentialStatusFragment]) {
            return TrustCertificationStatus.Revoked;
        }

        return TrustCertificationStatus.Valid;
    }

    function timestampToIsoDate(uint timestamp) private pure returns (string memory) {
        (uint year, uint month, uint day) = timestampToDate(timestamp);

        // 2020-01-01T01:01:01Z
        bytes memory result = new bytes(20);
        uintToBytes(year, result, 0, 4);
        result[4] = "-";
        uintToBytes(month, result, 5, 2);
        result[7] = "-";
        uintToBytes(day, result, 8, 2);
        result[10] = "T";
        uintToBytes((timestamp / 3600) % 24, result, 11, 2);
        result[13] = ":";
        uintToBytes((timestamp / 60) % 60, result, 14, 2);
        result[16] = ":";
        uintToBytes(timestamp % 60, result, 17, 2);
        result[19] = "Z";

        return string(result);
    }

    function timestampToDate(
        uint timestamp
    ) private pure returns (uint year, uint month, uint day) {
        // Move to the 1st March 0000
        uint timestampDays = (timestamp / (3600 * 24)) + 719468;
        // Compute the era knowing that there are 146097 days every 400 years
        uint era = timestampDays / 146097;
        // Compute the day of era, ranging from 0 to 146096
        uint dayOfEra = (timestampDays - era * 146097);
        // Compute the year of era, ranging from 0 to 399
        uint yearOfEra = (dayOfEra - dayOfEra / 1460 + dayOfEra / 36524 - dayOfEra / 146096) / 365;
        // Compute the day of year, ranging from 0 to 365
        uint dayOfYear = dayOfEra - (365 * yearOfEra + yearOfEra / 4 - yearOfEra / 100);
        // Compute the month shifted so that the first month is March
        uint shiftedMonth = (5 * dayOfYear + 2) / 153;

        // Compute the final result
        day = dayOfYear - (153 * shiftedMonth + 2) / 5 + 1;
        month = shiftedMonth < 10 ? shiftedMonth + 3 : shiftedMonth - 9;
        year = (yearOfEra + era * 400) + ((month <= 2) ? 1 : 0);
    }

    function isValidDid(string calldata stringToCheck) private view returns (bool) {
        bytes calldata stringBytes = bytes(stringToCheck);
        if (stringBytes.length < didSchemaLength) {
            return false;
        }
        bytes32 stringDidSchema = bytes32(stringBytes[0:didSchemaLength]);

        return stringBytes.length == (didSchemaLength + 40) && stringDidSchema == didSchema;
    }

    function didToAddress(string calldata did) private view returns (uint160) {
        // Assumption: The DID is valid

        bytes memory addressStringBytes = bytes(did[didSchemaLength:didSchemaLength + 40]);
        uint160 result = 0;
        for (uint i = 0; i < 40; i += 2) {
            result = result << 8;
            result |= uint160(
                (hexToByte(addressStringBytes[i]) << 4) | hexToByte(addressStringBytes[i + 1])
            );
        }

        return result;
    }

    function uintToBytes(uint number, bytes memory result, uint start, uint length) private pure {
        while (length > 0) {
            result[start + length - 1] = bytes1(48 + uint8(number % 10));
            length--;
            number /= 10;
        }
    }

    function uintToBytes(uint number) private pure returns (bytes memory) {
        uint length;
        if (number == 0) {
            length = 1;
        } else {
            uint numberCopy = number;
            while (numberCopy > 0) {
                length++;
                numberCopy /= 10;
            }
        }
        bytes memory result = new bytes(length);
        uintToBytes(number, result, 0, length);

        return result;
    }

    function hexToByte(bytes1 byteValue) private pure returns (uint256) {
        uint8 value = uint8(byteValue);

        if ((value >= 48 && value <= 57)) {
            return value - 48;
        }
        if (value >= 97 && value <= 102) {
            return 10 + (value - 97);
        }
        revert InvalidHexDigit("Invalid hex digit");
    }
}
