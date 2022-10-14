# Cognito Post Auth Lambda

Correspond à la lambda de [post-authentification](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-authentication.html) dans le parcours d'authentification de Cognito.

L'objectif de cette implémentation est de logguer les entrants de la lambda (l'événement et le contexte).

## Format de la requête

Consultez la doc Cognito pour le [format de la requête](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-authentication.html#cognito-user-pools-lambda-trigger-syntax-post-auth)

## Format de la réponse

La lambda renvoie le même événement que celui reçu en entrée de la lambda.
