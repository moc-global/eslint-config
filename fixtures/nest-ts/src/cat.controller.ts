import { Controller, Get } from '@nestjs/common';

// A minimal decorated controller used only to exercise the NestJS stack's rule
// loading (the type-aware @darraghor/eslint-plugin-nestjs-typed rules) without
// crashing ESLint. The @nestjs/* types are not installed in this repo, so this
// file reports unresolved imports — that is fine; the dogfood test only asserts
// that ESLint does not crash at load or rule time.
@Controller('cats')
export class CatController {
  @Get()
  public findAll(): string[] {
    return [];
  }
}
