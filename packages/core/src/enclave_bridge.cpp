#include <napi.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <Security/Security.h>
#include <CoreFoundation/CoreFoundation.h>

// Helper to convert CFStringRef to std::string
std::string CFStringToStdString(CFStringRef cfStr) {
    if (!cfStr) return "";
    CFIndex length = CFStringGetLength(cfStr);
    CFIndex maxSize = CFStringGetMaximumSizeForEncoding(length, kCFStringEncodingUTF8) + 1;
    std::vector<char> buffer(maxSize);
    if (CFStringGetCString(cfStr, buffer.data(), maxSize, kCFStringEncodingUTF8)) {
        return std::string(buffer.data());
    }
    return "";
}

// Generate Secure Enclave Key Pair with TouchID/FaceID Constraint
Napi::Value GenerateKey(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    CFErrorRef error = nullptr;
    SecAccessControlRef accessControl = SecAccessControlCreateWithFlags(
        kCFAllocatorDefault,
        kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        kSecAccessControlUserPresence | kSecAccessControlPrivateKeyUsage,
        &error
    );

    if (error) {
        std::string errStr = CFStringToStdString(CFErrorCopyDescription(error));
        CFRelease(error);
        Napi::Error::New(env, "Failed to create access control: " + errStr).ThrowAsJavaScriptException();
        return env.Null();
    }

    // Define attributes for Secure Enclave EC NIST P-256 key pair
    CFMutableDictionaryRef attributes = CFDictionaryCreateMutable(kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(attributes, kSecAttrKeyType, kSecAttrKeyTypeECSECPrimeRandom);
    CFDictionarySetValue(attributes, kSecAttrKeySizeInBits, CFSTR("256"));
    CFDictionarySetValue(attributes, kSecAttrTokenID, kSecAttrTokenIDSecureEnclave);

    CFMutableDictionaryRef privateKeyAttrs = CFDictionaryCreateMutable(kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(privateKeyAttrs, kSecAttrIsPermanent, kCFBooleanTrue);
    CFDictionarySetValue(privateKeyAttrs, kSecAttrAccessControl, accessControl);
    CFDictionarySetValue(privateKeyAttrs, kSecAttrLabel, CFSTR("XORAS_SECURE_ENCLAVE_KEY"));
    
    CFDictionarySetValue(attributes, kSecPrivateKeyAttrs, privateKeyAttrs);

    SecKeyRef privateKey = SecKeyCreateRandomKey(attributes, &error);
    
    CFRelease(attributes);
    CFRelease(privateKeyAttrs);
    CFRelease(accessControl);

    if (error) {
        std::string errStr = CFStringToStdString(CFErrorCopyDescription(error));
        CFRelease(error);
        Napi::Error::New(env, "Secure Enclave Key Gen Failed: " + errStr).ThrowAsJavaScriptException();
        return env.Null();
    }

    CFRelease(privateKey);
    return Napi::String::New(env, "XORAS_SECURE_ENCLAVE_KEY_GENERATED");
}

// Sign a SHA-256 hash using the Secure Enclave Key
Napi::Value Sign(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Buffer expected for SHA-256 hash").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Buffer<uint8_t> hashBuffer = info[0].As<Napi::Buffer<uint8_t>>();
    if (hashBuffer.Length() != 32) {
        Napi::Error::New(env, "Hash must be exactly 32 bytes (SHA-256)").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Retrieve private key reference
    CFMutableDictionaryRef query = CFDictionaryCreateMutable(kCFAllocatorDefault, 0, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(query, kSecClass, kSecClassKey);
    CFDictionarySetValue(query, kSecAttrKeyType, kSecAttrKeyTypeECSECPrimeRandom);
    CFDictionarySetValue(query, kSecAttrLabel, CFSTR("XORAS_SECURE_ENCLAVE_KEY"));
    CFDictionarySetValue(query, kSecReturnRef, kCFBooleanTrue);

    SecKeyRef privateKey = nullptr;
    OSStatus status = SecItemCopyMatching(query, (CFTypeRef*)&privateKey);
    CFRelease(query);

    if (status != errSecSuccess) {
        Napi::Error::New(env, "Secure Enclave Key Not Found. Please run generateKey first.").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Generate Signature
    CFDataRef hashData = CFDataCreate(kCFAllocatorDefault, hashBuffer.Data(), hashBuffer.Length());
    CFErrorRef error = nullptr;
    CFDataRef signature = SecKeyCreateSignature(
        privateKey,
        kSecKeyAlgorithmECDSASignatureMessageX962SHA256,
        hashData,
        &error
    );

    CFRelease(hashData);
    CFRelease(privateKey);

    if (error) {
        std::string errStr = CFStringToStdString(CFErrorCopyDescription(error));
        CFRelease(error);
        Napi::Error::New(env, "Signing Failed: " + errStr).ThrowAsJavaScriptException();
        return env.Null();
    }

    const uint8_t* sigBytes = CFDataGetBytePtr(signature);
    CFIndex sigLength = CFDataGetLength(signature);
    
    Napi::Buffer<uint8_t> resultBuffer = Napi::Buffer<uint8_t>::Copy(env, sigBytes, sigLength);
    CFRelease(signature);

    return resultBuffer;
}

#else
// Non-macOS Fallback Implementation (Graceful Fail)
Napi::Value GenerateKey(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Error::New(env, "Platform Unsupported: Secure Enclave is only supported on macOS.").ThrowAsJavaScriptException();
    return env.Null();
}

Napi::Value Sign(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Error::New(env, "Platform Unsupported: Secure Enclave is only supported on macOS.").ThrowAsJavaScriptException();
    return env.Null();
}
#endif

// Init Node addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("generateKey", Napi::Function::New(env, GenerateKey));
    exports.Set("sign", Napi::Function::New(env, Sign));
    return exports;
}

NODE_API_MODULE(enclave_bridge, Init)
