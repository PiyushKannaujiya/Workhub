const validate = (schema) => {
  return (req, res, next) => {
    // Validate the request body against the provided Zod schema
    const result = schema.safeParse(req.body);

    // Stop the request if validation fails
    if (!result.success) {
      res.status(400);

      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      throw new Error(message);
    }

    // Replace the body with validated data
    req.body = result.data;

    next();
  };
};

module.exports = validate;