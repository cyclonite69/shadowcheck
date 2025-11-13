# Contributing to ShadowCheck

First off, thank you for considering contributing to ShadowCheck! It's people like you that make ShadowCheck such a great tool for the security research community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Style Guides](#style-guides)
  - [Git Commit Messages](#git-commit-messages)
  - [TypeScript Style Guide](#typescript-style-guide)
  - [Documentation Style Guide](#documentation-style-guide)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [ShadowCheck Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for ShadowCheck. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**
- Check the [documentation](docs/) for solutions
- Search [existing issues](https://github.com/cyclonite69/shadowcheck/issues) to see if the problem has already been reported
- Collect information about the bug:
  - Stack trace if available
  - OS, Docker version, browser
  - Steps to reproduce
  - Expected vs actual behavior

**How to Submit A Good Bug Report:**

Use the bug report template and include:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Ubuntu 22.04]
 - Docker Version: [e.g. 24.0.5]
 - Browser: [e.g. Chrome 119]
 - ShadowCheck Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for ShadowCheck, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion:**
- Check if the enhancement has already been suggested
- Check if it aligns with the project's scope and goals
- Provide as much detail as possible

**Enhancement Suggestion Template:**

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Your First Code Contribution

Unsure where to begin? You can start by looking through these `good-first-issue` and `help-wanted` issues:

- [Good first issues](https://github.com/cyclonite69/shadowcheck/labels/good%20first%20issue) - issues which should only require a few lines of code
- [Help wanted issues](https://github.com/cyclonite69/shadowcheck/labels/help%20wanted) - issues which should be a bit more involved

### Pull Requests

The process described here has several goals:
- Maintain ShadowCheck's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible ShadowCheck
- Enable a sustainable system for ShadowCheck's maintainers to review contributions

**Pull Request Process:**

1. **Fork the repo** and create your branch from `master`
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Make your changes** with clear, logical commits
4. **Add tests** for new functionality
5. **Run tests** to ensure nothing breaks:
   ```bash
   npm test
   ```
6. **Update documentation** as needed
7. **Ensure your code** follows the style guidelines
8. **Submit a pull request** with a clear description

**Pull Request Template:**

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Fixes #(issue number)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes.

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Style Guides

### Git Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (white-space, formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(api): add surveillance detection endpoint

Implements automated surveillance pattern detection using spatial
correlation and temporal analysis.

Closes #123
```

```
fix(map): resolve clustering issue on zoom

Fixed bug where network clusters weren't updating correctly
when zooming in/out rapidly.

Fixes #456
```

### TypeScript Style Guide

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configuration
- Use **meaningful variable names**
- Add **JSDoc comments** for public APIs
- Prefer **const** over **let**, avoid **var**
- Use **async/await** over promises when possible
- Add **type annotations** for function parameters and return types

**Good Example:**
```typescript
/**
 * Calculate distance between two geographic coordinates
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

### Documentation Style Guide

- Use **Markdown** for all documentation
- Add **code examples** where applicable
- Include **screenshots** for UI features
- Keep documentation **up-to-date** with code changes
- Use **clear, concise language**
- Add **links** to related documentation

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS
- Docker and Docker Compose (recommended)

### Local Development

1. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/shadowcheck.git
cd shadowcheck
```

2. **Install dependencies:**
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL** (via Docker):
```bash
docker compose up -d postgres
```

5. **Run migrations:**
```bash
cd server
npm run migrate
```

6. **Start development servers:**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

7. **Access the application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Docker Development

```bash
# Start all services
docker compose up --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test/file.test.ts
```

### Writing Tests

- Place test files next to the code they test: `feature.ts` → `feature.test.ts`
- Use descriptive test names that explain what they verify
- Follow the **Arrange-Act-Assert** pattern
- Mock external dependencies appropriately

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateDistance } from './geoUtils';

describe('calculateDistance', () => {
  it('should calculate distance between two points', () => {
    // Arrange
    const lat1 = 43.0234;
    const lon1 = -83.6968;
    const lat2 = 43.0500;
    const lon2 = -83.7000;

    // Act
    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    // Assert
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(5000); // Should be < 5km
  });
});
```

## Community

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions, ideas, and general discussion
- **Pull Requests:** Code contributions and reviews

### Recognition

Contributors are recognized in several ways:
- Listed in the project README
- GitHub contributor badge
- Mentioned in release notes for significant contributions

### Getting Help

If you need help:
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/cyclonite69/shadowcheck/issues)
3. Ask in [GitHub Discussions](https://github.com/cyclonite69/shadowcheck/discussions)
4. Open a new issue with the `question` label

---

## Thank You!

Your contributions to open source, large or small, make projects like ShadowCheck possible. Thank you for taking the time to contribute!

## License

By contributing to ShadowCheck, you agree that your contributions will be licensed under the MIT License.
