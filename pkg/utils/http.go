package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func lambdaResponse(
	status int,
	body string,
) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: body,
	}
}

type HTTPError struct {
	error
	StatusCode int
}

type HTTPErrorResponse struct {
	Message string `json:"message"`
}

func (e *HTTPError) toLambdaResponse() events.APIGatewayProxyResponse {
	res := HTTPErrorResponse{
		Message: e.Error(),
	}

	body, _ := json.Marshal(res)

	return lambdaResponse(e.StatusCode, string(body))
}

func HTTPSuccess(body interface{}) events.APIGatewayProxyResponse {
	if body == nil {
		return lambdaResponse(http.StatusOK, "")
	}

	jsonBody, _ := json.Marshal(body)

	return lambdaResponse(http.StatusOK, string(jsonBody))
}

func HTTPBadRequest(message string) *HTTPError {
	return &HTTPError{
		error:      errors.New(message),
		StatusCode: http.StatusBadRequest,
	}
}

func HTTPNotFound(message string) *HTTPError {
	return &HTTPError{
		error:      errors.New(message),
		StatusCode: http.StatusNotFound,
	}
}

func HTTPConflict(message string) *HTTPError {
	return &HTTPError{
		error:      errors.New(message),
		StatusCode: http.StatusConflict,
	}
}

func HTTPPreconditionFailed(message string) *HTTPError {
	return &HTTPError{
		error:      errors.New(message),
		StatusCode: http.StatusPreconditionFailed,
	}
}

func HTTPInternalServerError(message string) *HTTPError {
	return &HTTPError{
		error:      errors.New(message),
		StatusCode: http.StatusInternalServerError,
	}
}

func HandleHTTPError(err error) events.APIGatewayProxyResponse {
	var httpError *HTTPError
	if errors.As(err, &httpError) {
		return httpError.toLambdaResponse()
	}

	fmt.Println("Non treated error", err)

	return HTTPInternalServerError("Internal server error").toLambdaResponse()
}
