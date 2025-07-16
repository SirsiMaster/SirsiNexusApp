# UI Component Package

This UI package is part of the SirsiNexus project. It provides the user interface for various components, using React and Radix UI.

## Features

- **Form Validation**: Utilizes react-hook-form for form handling and validation.
- **Modal Management**: Uses Redux for managing modal states across the application.
- **Dialog Components**: Built using Radix UI for accessible and interactive dialogs.
- **Select Components**: Allows filtering and selecting with dropdown components.
- **Error Handling**: Displays validation errors and warnings effectively across forms.

## Testing

This package includes a comprehensive test suite:

- **Framework**: Jest with React Testing Library
- **Coverage**: 93.3% of tests passing (97/104 tests)
- **Test Focus**: Ensures component rendering, form validation, modal functionality, and API mocking

### Running Tests

To execute the test suite, use:

```bash
npm test -- --passWithNoTests --verbose
```

## Development

Contributions to enhance UI components or fix issues are welcome. Please adhere to the existing coding style:
- **Linting**: Use eslint for maintaining code quality
- **Commit Messages**: Follow conventional commits for commit messages

## License

This project is open-source and available under the MIT License.

