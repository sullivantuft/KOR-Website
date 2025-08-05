module.exports = {
  rules: {
    // Only enforce critical CSS validation
    'block-no-empty': true,
    'declaration-block-no-duplicate-properties': true,
    'no-invalid-double-slash-comments': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'property-no-unknown': true,
    'unit-no-unknown': true,

    // Disable overly strict formatting rules
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'no-descending-specificity': null,
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'color-named': null,
    'declaration-no-important': null,
    'comment-empty-line-before': null,
    'comment-whitespace-inside': null,
    'no-duplicate-selectors': null,
    'font-family-name-quotes': null,

    // Allow common at-rules
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'import'
        ]
      }
    ]
  }
};
