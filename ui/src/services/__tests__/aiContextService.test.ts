import { aiContextService, AIContextService } from '../aiContextService';

describe('AIContextService', () => {
  let service: AIContextService;

  beforeEach(() => {
    service = AIContextService.getInstance();
    // Reset context before each test
    service.setContext({
      feature: 'test',
      page: 'test-page'
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AIContextService.getInstance();
      const instance2 = AIContextService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Context Management', () => {
    it('should set and get context correctly', () => {
      const testContext = {
        feature: 'optimization',
        page: 'docs',
        userAction: 'reading',
        systemState: { test: 'value' }
      };

      service.setContext(testContext);
      const context = service.getContext();

      expect(context).toMatchObject(testContext);
    });

    it('should merge context when setting partial context', () => {
      service.setContext({
        feature: 'analytics',
        page: 'dashboard'
      });

      service.setContext({
        userAction: 'viewing_chart'
      });

      const context = service.getContext();
      expect(context).toMatchObject({
        feature: 'analytics',
        page: 'dashboard',
        userAction: 'viewing_chart'
      });
    });
  });

  describe('Contextual Help', () => {
    it('should provide default help when no context is set', async () => {
      const freshService = new (AIContextService as any)();
      const help = await freshService.getContextualHelp();

      expect(help.message).toContain("I'm ready to help!");
      expect(help.suggestions).toHaveLength(3);
    });

    it('should provide feature-specific help', async () => {
      service.setContext({
        feature: 'ai-orchestration',
        page: 'overview'
      });

      const help = await service.getContextualHelp();

      expect(help.message).toContain('AI decision-making');
      expect(help.suggestions).toBeDefined();
      expect(help.documentation).toBeDefined();
    });

    it('should provide page-specific help for docs pages', async () => {
      service.setContext({
        feature: 'optimization',
        page: 'docs'
      });

      const help = await service.getContextualHelp();

      expect(help.message).toContain('documentation');
      expect(help.tips).toContain("Use Ctrl+F to search within the documentation");
    });

    it('should provide tutorial-specific help', async () => {
      service.setContext({
        feature: 'analytics',
        page: 'tutorial'
      });

      const help = await service.getContextualHelp();

      expect(help.message).toContain('tutorial');
      expect(help.actions).toBeDefined();
      expect(help.actions![0].type).toBe('navigate');
    });
  });

  describe('Query Processing', () => {
    beforeEach(() => {
      service.setContext({
        feature: 'optimization',
        page: 'overview'
      });
    });

    it('should handle error queries', async () => {
      const help = await service.getContextualHelp('I have an error');

      expect(help.message).toContain('troubleshoot');
      expect(help.actions).toBeDefined();
      expect(help.tips).toBeDefined();
    });

    it('should handle configuration queries', async () => {
      const help = await service.getContextualHelp('How do I configure this?');

      expect(help.message).toContain('configure');
      expect(help.tips).toBeDefined();
      expect(help.warnings).toBeDefined();
    });

    it('should handle getting started queries', async () => {
      const help = await service.getContextualHelp('How do I get started?');

      expect(help.message).toContain('get started');
      expect(help.actions).toBeDefined();
      expect(help.documentation).toBeDefined();
    });

    it('should handle API queries', async () => {
      const help = await service.getContextualHelp('What are the API endpoints?');

      expect(help.message).toContain('API endpoints');
      expect(help.actions).toBeDefined();
      expect(help.tips).toContain('All APIs require authentication with Bearer tokens');
    });

    it('should handle performance queries', async () => {
      const help = await service.getContextualHelp('How can I improve performance?');

      expect(help.message).toContain('performance metrics');
      expect(help.actions).toBeDefined();
    });
  });

  describe('Field Help', () => {
    it('should provide CPU field help', () => {
      const help = service.getFieldHelp('cpu', 'number', 8);

      expect(help.message).toContain('CPU allocation');
      expect(help.tips).toBeDefined();
      expect(help.suggestions).toContain("What's the recommended value?");
    });

    it('should provide memory field help', () => {
      const help = service.getFieldHelp('memory', 'number', 16);

      expect(help.message).toContain('Memory configuration');
      expect(help.tips).toBeDefined();
    });

    it('should provide timeout field help with warnings for high values', () => {
      const help = service.getFieldHelp('timeout', 'number', 400);

      expect(help.message).toContain('Timeout values');
      expect(help.warnings).toHaveLength(1);
      expect(help.warnings![0]).toContain('long timeouts');
    });

    it('should provide generic help for unknown fields', () => {
      const help = service.getFieldHelp('unknownField', 'text');

      expect(help.message).toContain('unknownField field');
      expect(help.suggestions).toContain("What should I enter here?");
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields correctly', () => {
      const result = service.validateField('testField', '', { required: true });

      expect(result.isValid).toBe(false);
      expect(result.aiHelp).toBeDefined();
      expect(result.aiHelp!.message).toContain('required');
    });

    it('should validate min value correctly', () => {
      const result = service.validateField('testField', 5, { min: 10 });

      expect(result.isValid).toBe(false);
      expect(result.aiHelp!.message).toContain('at least 10');
    });

    it('should validate max value correctly', () => {
      const result = service.validateField('testField', 15, { max: 10 });

      expect(result.isValid).toBe(false);
      expect(result.aiHelp!.message).toContain('cannot exceed 10');
    });

    it('should validate pattern correctly', () => {
      const result = service.validateField('testField', 'Invalid123', { 
        pattern: /^[a-z]+$/ 
      });

      expect(result.isValid).toBe(false);
      expect(result.aiHelp!.message).toContain('format is invalid');
    });

    it('should pass validation for valid values', () => {
      const result = service.validateField('testField', 'valid', {
        required: true,
        min: 1,
        max: 10,
        pattern: /^[a-z]+$/
      });

      expect(result.isValid).toBe(true);
      expect(result.aiHelp).toBeUndefined();
    });
  });

  describe('Knowledge Base', () => {
    it('should have knowledge for all major features', () => {
      const features = [
        'ai-orchestration',
        'analytics', 
        'optimization',
        'migration',
        'security',
        'hypervisor'
      ];

      features.forEach(feature => {
        service.setContext({ feature, page: 'test' });
        expect(() => service.getContextualHelp()).not.toThrow();
      });
    });

    it('should provide metrics for known features', async () => {
      service.setContext({
        feature: 'analytics',
        page: 'overview'
      });

      const help = await service.getContextualHelp();
      expect(help.message).toContain('94%');
    });
  });

  describe('Error Handling', () => {
    it('should handle null context gracefully', async () => {
      const freshService = new (AIContextService as any)();
      const help = await freshService.getContextualHelp();

      expect(help).toBeDefined();
      expect(help.message).toBeDefined();
    });

    it('should handle unknown features gracefully', async () => {
      service.setContext({
        feature: 'unknown-feature',
        page: 'test'
      });

      const help = await service.getContextualHelp();
      expect(help).toBeDefined();
      expect(help.message).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond quickly to contextual help requests', async () => {
      const start = Date.now();
      await service.getContextualHelp();
      const end = Date.now();

      expect(end - start).toBeLessThan(100); // Should respond in under 100ms
    });

    it('should handle multiple rapid requests', async () => {
      const promises = Array(10).fill(null).map(() => 
        service.getContextualHelp()
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBeDefined());
    });
  });
});
