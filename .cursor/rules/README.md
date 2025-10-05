# Cursor Rules for TypeScript Backend Toolkit

This directory contains Cursor Rules (`.mdc` files) that help AI assistants understand and work with this codebase effectively.

## Rules Overview

### Core Architecture Rules

**[architecture.mdc](architecture.mdc)** - _Always Applied_

- Core architectural patterns
- Technology stack overview
- MagicRouter system
- Module structure
- Configuration management
- Background jobs and queues

### File-Type Specific Rules

**[routing.mdc](routing.mdc)** - _Applies to: `_.router.ts`, `_.routes.ts`_

- MagicRouter usage patterns
- Route configuration
- Authentication middleware
- File upload handling
- Common routing mistakes

**[schemas.mdc](schemas.mdc)** - _Applies to: `_.schema.ts`\*

- Zod schema patterns
- OpenAPI metadata
- Request/response validation
- Common schema patterns
- Type inference

**[controllers.mdc](controllers.mdc)** - _Applies to: `_.controller.ts`\*

- Controller patterns
- Request handling
- JWT payload access
- Error handling
- Response formatting

**[services.mdc](services.mdc)** - _Applies to: `_.service.ts`, `_.services.ts`_

- Service layer patterns
- Database operations
- Business logic
- Background jobs
- Error handling

**[models.mdc](models.mdc)** - _Applies to: `_.model.ts`\*

- Mongoose model patterns
- Schema definitions
- Indexes
- Hooks/middleware
- Virtual properties
- Instance and static methods

### Configuration & Environment

**[environment.mdc](environment.mdc)** - _Applies to: `.env_`, `config.service.ts`\*

- Environment variables
- Configuration management
- Required variables
- Adding new config
- Security best practices

**[email.mdc](email.mdc)** - _Applies to: `src/email/\*\*/_`, `email.queue.ts`\*

- Email system architecture
- React Email templates
- Mailgun integration
- Queue-based sending
- Common email patterns

### Development & Workflows

**[development.mdc](development.mdc)** - _Manual Application_

- Setup instructions
- Development commands
- Project structure
- Testing the API
- Debugging tips
- Common issues
- Production deployment

**[new-module.mdc](new-module.mdc)** - _Manual Application_

- Step-by-step guide for creating new modules
- Complete example with all files
- Registration steps
- Testing checklist

## How Rules Are Applied

### Automatic Application

Rules are automatically applied based on:

- **Always Apply**: Rules with `alwaysApply: true` in frontmatter
- **File Globs**: Rules with `globs` pattern matching current file
- **Description**: AI can fetch rules based on description

### Manual Application

Some rules (like `new-module.mdc` and `development.mdc`) are applied when:

- User explicitly references the task
- AI determines the rule is relevant to the current task

## Rule File Format

Each rule file uses Markdown with YAML frontmatter:

```markdown
---
alwaysApply: true|false
description: 'Rule description'
globs: '*.ts,*.tsx'
---

# Rule Content in Markdown

Rules can reference files using:
[filename.ext](mdc:path/to/filename.ext)
```

## Adding New Rules

To add a new rule:

1. Create a new `.mdc` file in this directory
2. Add YAML frontmatter with appropriate metadata
3. Write rule content in Markdown
4. Reference files using `[name](mdc:path)` format
5. Test with AI assistant

## Best Practices

- Keep rules focused and specific
- Use file globs to target specific file types
- Reference actual code files with `mdc:` links
- Provide examples and common patterns
- List common mistakes to avoid
- Keep rules up-to-date with codebase changes

## Rule Maintenance

When updating the codebase:

- Update relevant rules if patterns change
- Add new rules for new features/patterns
- Remove obsolete rules
- Keep examples current and working

## Questions?

If you need to modify or add rules, refer to the Cursor Rules documentation or ask the AI assistant for help.
