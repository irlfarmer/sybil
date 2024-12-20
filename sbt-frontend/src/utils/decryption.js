import forge from 'node-forge';

class DecryptionService {
  constructor() {
    this.privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5tAqXPRHs/6Kh
JiQJC0siJJpuUgLh0zf8JEl81FzN3pFxn6HdFUvMPbIg8B1gZ3PH41DLAUn1fuEX
QYr3S0AM3ksOsNDZSTiFjM+LefClTsGgHeM0HGhvJX5BcTr/kSETcyYtWg8tjRrc
/0vkl0XkndpyE1rekl1x1CCmZiA7qW/viWwnVJqATXRxfpgpoSqxrNEi43j83ccV
4BNE77K5Xfi4P8ROz6a5AjCVK4qAhfpgR61LREajyFBZQNaUSD5svVB+8dP752/z
MlAbVZ3H5n6EZ4VmKMYPrzz8CTZg50SIgsbERI2t14TL7ZccevIQz+qw4EhI1Kul
SKKiBv/JAgMBAAECggEABV22O6IMYU6OvrzZKDi/Eky/+KWehzOBB+RtijGhv+Ip
TkD4XqjVoKB8w/ZkRuueXR2MsV0Ha9RfgTpH33b5chW/UfyagFjdDQDhY2yh30j8
D9olPVV/0AxjjlUNCSMCs2rtpLxYOW79InsvEHstjhpgnFDCXLGaiSZBzkUfs9GY
Opnc+ujCNecSSEkuxupuE4Y+3/JpGZm/ZAfirDuBsNhwjm7PwTAW39vKvkkyct9H
7TwIy+12gDPoi0XYh4QgL5avKppVV6vy406rsFSd5jDs5rHgIJYXjIDrXqxEFBQ9
djwXcFPOOtfaSjBh+hH9R/fSc/8vbDecCQ6xwWPi7QKBgQDhWk5uARB0iCteQH2E
0ipjhNBn5eKUnfZ0qH07EZZwXzVndqx1rkvKW6BbBmIxwiC+9SUAIKoQYQ7XJfYL
fGJ6yH0fP41zcqo8Pkhy8D/+qmu9MWcVfYsKNXY8V8kL1phJUYYPctaFGGrMQzNP
tCL3GUTduyd9OycjwyIFj0+nhQKBgQDS9VUBFi5eLtfyywxazjoMfugM4h94deex
5TiSoj2ooxI97xlHzOjVPbGCi7gc80m3T22yriH6SQXRUHBMlQVV6a8brmBLlQ/X
LJM2jpIPEkh9LS5a9e+Ivat8DMLrmbW/Xdg6N/LowxrZtyxIOZv2gwCz96EltLC1
C5YyieSwdQKBgQDEiaMfU3RLfbr9D5eo8Dah5uJvytGKth2M7qmRi6w9wvtridet
Jt7Y1IKNAItBREKU6G5lpxdLA6sSvvvQVqH43cQqLZ4rEtUfh15eR+Q4Md+W+HAk
EQLjW28L/6/K0FSulRgrfwdSutHh5bXpjHx2Lyadjy1Ijf97tCKG4M8ilQKBgDqP
0k4f6zVICbijt0VJ9IFdhWt2JkhZar1OpZrHIRi8VCcPRdRRxNzVaH6V7MFUpEUX
7projhQdy1ik3NfVkoqb+XlUufShZ6lS/Xbqsw8uAyOEtFaZ6SnrhTxFiqK+o96A
3bKjr3IAH2cK22cdXvdavIo5FuoRs/A+TC6xauO1AoGAZ85v9eJUu4EzJG1//zK/
DAvVwQZXdgLongsfm7HewO2cdziBd3ANNfMNcmwvwtm54hjwSiesj/STjO+cWyFA
Bp0VU66F41VNji43yX7xyw/8T0NL31EsXB0I4QEYN2v3YeqihTEeZof3qwCc7NkT
L8RCyffBq/ch+dfkq7hGfS4=
-----END PRIVATE KEY-----`;
  }

  decryptResponse(encryptedData) {
    try {
      // Split the chunks
      const chunks = encryptedData.split('|');
      const privateKey = forge.pki.privateKeyFromPem(this.privateKey);
      
      // Decrypt each chunk
      const decryptedChunks = chunks.map(chunk => {
        const buffer = forge.util.decode64(chunk);
        return privateKey.decrypt(buffer);
      });

      // Join chunks and parse JSON
      const jsonString = decryptedChunks.join('');
      return JSON.parse(jsonString);

    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }
}
 // eslint-disable-next-line
export default new DecryptionService(); 