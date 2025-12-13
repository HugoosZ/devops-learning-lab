import fs from 'node:fs/promises'

type Creds = { email: string; password: string }

export class AuthService {
    private credentialsFilePath = 'data/credentials.json'

    async getCredentials(): Promise<Creds> {
        const data = await fs.readFile(this.credentialsFilePath, 'utf-8')
        return JSON.parse(data)
    }

    async validateUser(email: string, password: string): Promise<boolean> {
        const credentials = await this.getCredentials()
        return credentials.email === email && credentials.password === password
    }
}