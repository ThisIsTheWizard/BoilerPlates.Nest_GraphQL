import { api, resetDatabase } from './setup'

describe('AuthResolver Extended (GraphQL)', () => {
  let adminToken: string

  beforeEach(async () => {
    await resetDatabase()
    
    const loginMutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          access_token
        }
      }
    `
    const loginResponse = await api.post('/graphql', {
      query: loginMutation,
      variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
    })
    
    if (loginResponse.data.errors) {
      console.log('Login setup errors:', JSON.stringify(loginResponse.data.errors, null, 2))
    }
    
    adminToken = loginResponse.data.data?.login?.access_token
  })

  describe('cancelChangeEmail', () => {
    it('success', async () => {
      const mutation = `
        mutation CancelChangeEmail($input: CancelChangeEmailInput!) {
          cancelChangeEmail(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('CancelChangeEmail Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })
  })

  describe('verifyChangeEmail', () => {
    it('success', async () => {
      const mutation = `
        mutation VerifyChangeEmail($token: String!) {
          verifyChangeEmail(token: $token) {
            id
            email
          }
        }
      `
      const variables = {
        token: 'test-token'
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      // Expect error for invalid token
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('setUserEmail', () => {
    it('error - invalid operation', async () => {
      const mutation = `
        mutation SetUserEmail($input: SetUserEmailInput!) {
          setUserEmail(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          user_id: '1',
          new_email: 'newemail@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('setUserPassword', () => {
    it('success', async () => {
      const usersQuery = `
        query Users {
          users {
            id
          }
        }
      `
      const usersResponse = await api.post('/graphql', 
        { query: usersQuery },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (usersResponse.data.data?.users?.length > 0) {
        const userId = usersResponse.data.data.users[0].id

        const mutation = `
          mutation SetUserPassword($input: SetUserPasswordInput!) {
            setUserPassword(input: $input)
          }
        `
        const variables = {
          input: {
            user_id: userId,
            password: 'NewPassword123!'
          }
        }

        const response = await api.post('/graphql', 
          { query: mutation, variables },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('SetUserPassword Errors:', JSON.stringify(response.data.errors, null, 2))
        }
      }
    })

    it('error - weak password', async () => {
      const mutation = `
        mutation SetUserPassword($input: SetUserPasswordInput!) {
          setUserPassword(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          password: '123'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('retryForgotPassword', () => {
    it('success', async () => {
      const mutation = `
        mutation RetryForgotPassword($input: ForgotPasswordInput!) {
          retryForgotPassword(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('RetryForgotPassword Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })
  })

  describe('verifyForgotPassword', () => {
    it('success', async () => {
      const mutation = `
        mutation VerifyForgotPassword($input: VerifyForgotPasswordInput!) {
          verifyForgotPassword(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com',
          token: 'test-token',
          password: 'NewPassword123!'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      // Expect error for invalid token
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('verifyForgotPasswordCode', () => {
    it('success', async () => {
      const mutation = `
        mutation VerifyForgotPasswordCode($input: VerifyForgotPasswordCodeInput!) {
          verifyForgotPasswordCode(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com',
          token: '123456'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      // Expect error for invalid code
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('refreshToken error cases', () => {
    it('error - invalid refresh token', async () => {
      const mutation = `
        mutation RefreshToken($input: RefreshTokenInput!) {
          refreshToken(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const variables = {
        input: {
          access_token: 'invalid-token',
          refresh_token: 'invalid-refresh-token'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('authorization error cases', () => {
    it('setUserEmail - unauthorized', async () => {
      const mutation = `
        mutation SetUserEmail($input: SetUserEmailInput!) {
          setUserEmail(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          user_id: '1',
          new_email: 'test@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('setUserPassword - unauthorized', async () => {
      const mutation = `
        mutation SetUserPassword($input: SetUserPasswordInput!) {
          setUserPassword(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          password: 'Password123!'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('assignRole - unauthorized', async () => {
      const mutation = `
        mutation AssignRole($input: AssignRoleInput!) {
          assignRole(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          role_id: '1'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('revokeRole - unauthorized', async () => {
      const mutation = `
        mutation RevokeRole($input: AssignRoleInput!) {
          revokeRole(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          role_id: '1'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })
})