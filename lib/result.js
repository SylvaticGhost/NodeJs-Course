class Result {
    code;
    message;
    value;

    constructor(code, message, value) {
        this.code = code;
        this.message = message;
        this.value = value;
    }

    static success(value, code = 200) {
        return new Result(code, null, value);
    }

    static successCreate(value) {
        return Result.success(value, 201);
    }

    static fail(message, code ) {
        return new Result(code, message, null);
    }

    static badRequest(message = 'Bad request') {
        return Result.fail(message, 400);
    }

    static internalError(message = 'Internal server error') {
        return Result.fail(message, 500);
    }

    static notFound(message = 'Not found') {
        return Result.fail(message, 404);
    }

    static forbidden(message = 'Forbidden') {
        return Result.fail(message, 403);
    }

    asEndpointResponse(res) {
        return res.status(this.code).json(this);
    }
}

module.exports = {
    Result,
};
