# Saleor compatibility

- mutations appProblemCreate and appProblemDismiss are available from Saleor versions 3.22.36
- when using AppProblemsReporter either check Saleor version OR gracefully handle the error
- Do not log "error" in case of error, which will bloat logs. Log info/warning instead.