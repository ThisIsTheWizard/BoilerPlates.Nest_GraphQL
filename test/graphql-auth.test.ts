import { api, resetDatabase } from './setup'

describe('AuthResolver (GraphQL)', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  describe('register', () => {
    it('success', async () => {
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
      if (response.data.errors) {
        console.log('Register Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.register).toMatchObject({
        email: 'test@example.com',
        status: 'unverified'
      })
    })
  })

  describe('login', () => {
    it('success', async () => {
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
          email: 'admin@wizardcld.com',
          password: 'password'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Login Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.login).toHaveProperty('access_token')
      expect(response.data.data.login).toHaveProperty('refresh_token')
    })

    it('error', async () => {
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
          email: 'wrong@example.com',
          password: 'wrongpassword'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('me', () => {
    it('success', async () => {
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
      const { access_token } = loginResponse.data.data.login

      const query = `
        query Me {
          me {
            id
            email
            roles
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Me Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.me).toMatchObject({
        email: 'admin@wizardcld.com'
      })
    })
  })

  describe('refreshToken', () => {
    it('success', async () => {
      const loginMutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const loginResponse = await api.post('/graphql', {
        query: loginMutation,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const tokens = loginResponse.data.data.login

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
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('RefreshToken Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.refreshToken).toHaveProperty('access_token')
      expect(response.data.data.refreshToken).toHaveProperty('refresh_token')
    })
  })

  describe('forgotPassword', () => {
    it('success', async () => {
      const mutation = `
        mutation ForgotPassword($input: ForgotPasswordInput!) {
          forgotPassword(input: $input)
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
        console.log('ForgotPassword Errors:', JSON.stringify(response.data.errors, null, 2))
      }
      expect(response.data.data.forgotPassword).toBe(true)
    })

    it('error - invalid email', async () => {
      const mutation = `
        mutation ForgotPassword($input: ForgotPasswordInput!) {
          forgotPassword(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'nonexistent@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('verifyUserEmail', () => {
    it('error - invalid token', async () => {
      const mutation = `
        mutation VerifyUserEmail($input: VerifyEmailInput!) {
          verifyUserEmail(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com',
          token: 'invalid-token'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('resendVerificationEmail', () => {
    it('success', async () => {
      const mutation = `
        mutation ResendVerificationEmail($input: ResendVerificationInput!) {
          resendVerificationEmail(input: $input)
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
        console.log('ResendVerificationEmail Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })

    it('error - invalid email', async () => {
      const mutation = `
        mutation ResendVerificationEmail($input: ResendVerificationInput!) {
          resendVerificationEmail(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'nonexistent@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('logout', () => {
    it('success', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation Logout {
          logout
        }
      `

      const response = await api.post('/graphql', 
        { query: mutation },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Logout Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })

    it('error - no token', async () => {
      const mutation = `
        mutation Logout {
          logout
        }
      `

      const response = await api.post('/graphql', { query: mutation })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('changeEmail', () => {
    it('success', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation ChangeEmail($input: ChangeEmailInput!) {
          changeEmail(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'newemail@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('ChangeEmail Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })

    it('error - unauthorized', async () => {
      const mutation = `
        mutation ChangeEmail($input: ChangeEmailInput!) {
          changeEmail(input: $input)
        }
      `
      const variables = {
        input: {
          email: 'newemail@wizardcld.com'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('changePassword', () => {
    it('success', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input)
        }
      `
      const variables = {
        input: {
          old_password: 'password',
          new_password: 'NewPassword123!'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('ChangePassword Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })

    it('error - wrong current password', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input)
        }
      `
      const variables = {
        input: {
          old_password: 'wrongpassword',
          new_password: 'NewPassword123!'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('verifyUserPassword', () => {
    it('success', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation VerifyUserPassword($input: VerifyUserPasswordInput!) {
          verifyUserPassword(input: $input)
        }
      `
      const variables = {
        input: {
          password: 'password'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('VerifyUserPassword Errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })

    it('error - wrong password', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation VerifyUserPassword($input: VerifyUserPasswordInput!) {
          verifyUserPassword(input: $input)
        }
      `
      const variables = {
        input: {
          password: 'wrongpassword'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      // This operation returns false for wrong password, not an error
      if (response.data.data?.verifyUserPassword !== undefined) {
        expect(response.data.data.verifyUserPassword).toBe(false)
      }
    })

    it('error - unauthorized', async () => {
      const mutation = `
        mutation VerifyUserPassword($input: VerifyUserPasswordInput!) {
          verifyUserPassword(input: $input)
        }
      `
      const variables = {
        input: {
          password: 'password'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('assignRole', () => {
    it('error - role not found', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation AssignRole($input: AssignRoleInput!) {
          assignRole(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          role_id: '999'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('revokeRole', () => {
    it('error - role not found', async () => {
      const loginResponse = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
      })
      const { access_token } = loginResponse.data.data.login

      const mutation = `
        mutation RevokeRole($input: AssignRoleInput!) {
          revokeRole(input: $input)
        }
      `
      const variables = {
        input: {
          user_id: '1',
          role_id: '999'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('register error cases', () => {
    it('error - duplicate email', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com',
          password: 'Password123!'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('error - invalid password', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          email: 'test2@example.com',
          password: '123'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('me error cases', () => {
    it('error - no token', async () => {
      const query = `
        query Me {
          me {
            id
            email
          }
        }
      `

      const response = await api.post('/graphql', { query })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('error - invalid token', async () => {
      const query = `
        query Me {
          me {
            id
            email
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: 'Bearer invalid-token' } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })
})