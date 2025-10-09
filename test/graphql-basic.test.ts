import { api, resetDatabase } from './setup'

describe('GraphQL Basic Tests', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  describe('GraphQL Endpoint', () => {
    it('should respond to GraphQL queries', async () => {
      const query = `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `

      const response = await api.post('/graphql', { query })
      expect(response.status).toBe(200)
      expect(response.data.data.__schema).toBeDefined()
    })
  })

  describe('Auth Mutations', () => {
    it('register should work', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            email
            status
          }
        }
      `
      const variables = {
        input: {
          email: 'test@example.com',
          password: 'Password123!',
          first_name: 'Test',
          last_name: 'User'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.data.register).toMatchObject({
        email: 'test@example.com',
        status: 'unverified'
      })
    })

    it('login should work', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const variables = {
        input: {
          email: 'admin@test.com',
          password: 'password'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('GraphQL Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.login).toHaveProperty('access_token')
      expect(response.data.data.login).toHaveProperty('refresh_token')
    })
  })
})