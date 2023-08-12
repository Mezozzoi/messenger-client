export default interface HttpError {
    status: number,
    data: {
        error?: string,
        message?: string,
        statusCode: number
    }
}