# Theater E2E Test Skill

Validates Theater route and core Phase 2 components.

## Tests

1. **Route Loading**: `/theater` responds with 200
2. **Three.js Scene**: Canvas renders without error
3. **VRM Avatar**: Loads or falls back to sphere
4. **SSE Stream**: Connection established, data flowing
5. **Bilingual UI**: EN/ES toggle works
6. **Ivette Controls**: Interrupt, approve, reject buttons respond
7. **API Endpoints**: All 8 Phase 2 routes respond

## Usage

```bash
/skill theater-e2e
```

Returns: Test summary with pass/fail for each component.
