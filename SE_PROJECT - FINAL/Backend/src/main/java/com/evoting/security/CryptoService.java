package com.evoting.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.file.Files;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import javax.crypto.Cipher;

@Service
public class CryptoService {

    private static final Logger logger = LoggerFactory.getLogger(CryptoService.class);

    @Value("${app.security.rsa.key-dir:./keys}")
    private String keyDir;

    private KeyPair keyPair;

    @PostConstruct
    public void init() {
        try {
            File dir = new File(keyDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File privateKeyFile = new File(dir, "private.pem");
            File publicKeyFile = new File(dir, "public.pem");

            if (privateKeyFile.exists() && publicKeyFile.exists()) {
                loadKeys(privateKeyFile, publicKeyFile);
                logger.info("RSA keypair loaded from persistent storage");
            } else {
                generateAndSaveKeys(privateKeyFile, publicKeyFile);
                logger.info("Generated and persisted new RSA keypair");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize RSA keys", e);
        }
    }

    private void generateAndSaveKeys(File privFile, File pubFile) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        this.keyPair = generator.generateKeyPair();

        writePemFile(privFile, "PRIVATE KEY", keyPair.getPrivate().getEncoded());
        writePemFile(pubFile, "PUBLIC KEY", keyPair.getPublic().getEncoded());
    }

    private void loadKeys(File privFile, File pubFile) throws Exception {
        byte[] privBytes = readPemFile(privFile, "PRIVATE KEY");
        byte[] pubBytes = readPemFile(pubFile, "PUBLIC KEY");

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privBytes));
        PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(pubBytes));

        this.keyPair = new KeyPair(publicKey, privateKey);
    }

    private void writePemFile(File file, String type, byte[] content) throws Exception {
        String base64 = Base64.getMimeEncoder(64, new byte[] { '\n' }).encodeToString(content);
        String pem = "-----BEGIN " + type + "-----\n" + base64 + "\n-----END " + type + "-----";
        Files.writeString(file.toPath(), pem);
    }

    private byte[] readPemFile(File file, String type) throws Exception {
        String pem = Files.readString(file.toPath());
        String header = "-----BEGIN " + type + "-----";
        String footer = "-----END " + type + "-----";

        int start = pem.indexOf(header);
        int end = pem.indexOf(footer);

        if (start == -1 || end == -1) {
            throw new IllegalArgumentException("Invalid PEM format in " + file.getName());
        }

        String base64 = pem.substring(start + header.length(), end).replaceAll("\\s", "");
        return Base64.getDecoder().decode(base64);
    }

    public String getPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }

    public String decrypt(String encryptedBase64) {
        try {
            Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPPadding");
            javax.crypto.spec.OAEPParameterSpec oaepParams = new javax.crypto.spec.OAEPParameterSpec(
                    "SHA-256",
                    "MGF1",
                    java.security.spec.MGF1ParameterSpec.SHA256,
                    javax.crypto.spec.PSource.PSpecified.DEFAULT);
            cipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate(), oaepParams);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedBase64));
            return new String(decryptedBytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("INVALID_ENCRYPTION: Decryption failed", e);
        }
    }
}
