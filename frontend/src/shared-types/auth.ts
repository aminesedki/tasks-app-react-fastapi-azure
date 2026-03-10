export type UserProfile = {
    id: string | number
    email: string
} | null


export type TokenType = {

    access_token: string
    refresh_token: string
    token_type: string
}

export type RefreshTokenType = {

    access_token: string
    token_type: string
}

export type CreatedUserType = {
    id: number
    email: string
    created_at: Date
}