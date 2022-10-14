# Cognito Pre Auth Lambda

Correspond à la lambda de [pre-authentification](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-authentication.html) dans le parcours d'authentification de Cognito.

L'objectif de cette implémentation est de vérifier pour les utilisateurs confirmés
qu'ils sont bien des speakers (autrement on renvoie une erreur pour rejeter l'authentification).

Il s'agit ici d'introduire le cas d'utilisation où les attributs de l'utilisateur présents dans le user pool
ne suffisent pas à valider l'authentification. En effet, le contrôle du speaker dépend d'une requête vers une base de données.

## Format de la requête

Consultez la doc Cognito pour le [format de la requête](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-authentication.html#cognito-user-pools-lambda-trigger-syntax-pre-auth)

## Format de la réponse

La lambda renvoie le même événement que celui reçu en entrée de la lambda.
