# Android Keystore Configuration

Для сборки подписанного release APK необходимо создать keystore файл и настроить переменные окружения.

## Локальная сборка с подписью

1. Создайте keystore:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

2. Создайте файл `keystore.properties` в корне проекта (`artifacts/mobile/`):
```properties
storePassword=<ваш_пароль_от_keystore>
keyPassword=<ваш_пароль_от_ключа>
keyAlias=my-alias
storeFile=../my-release-key.jks
```

3. Добавьте `keystore.properties` в `.gitignore` (уже сделано)

## GitHub Actions для подписанной сборки

Для автоматической подписи на GitHub Actions:

1. Создайте keystore локально
2. Закодируйте его в base64:
```bash
base64 my-release-key.jks > encoded.keystore
```

3. Добавьте в Secrets репозитория на GitHub:
   - `KEYSTORE_BASE64` — содержимое файла `encoded.keystore`
   - `KEYSTORE_PASSWORD` — пароль от keystore
   - `KEY_ALIAS` — алиас ключа
   - `KEY_PASSWORD` — пароль от ключа

4. Используйте workflow `android-release.yml` для подписанной сборки

## Важно!

- Никогда не коммитьте файлы keystore и properties в репозиторий
- Храните секреты только в GitHub Secrets
- Debug APK собирается без подписи и доступен для всех сборок
