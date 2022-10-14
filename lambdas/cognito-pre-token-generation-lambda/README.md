# Cognito Pre Token Generation Lambda

Correspond à la lambda de [pre-token generation](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-token-generation.html) dans le parcours d'authentification de Cognito.

L'objectif de cette implémentation est d'ajouter une nouvelle claim dans l'idToken qui est le `sessionId` (un uuid aléatoire et unique pour chaque authentification).

## Format de la requête

Consultez la doc Cognito pour le [format de la requête](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-token-generation.html#cognito-user-pools-lambda-trigger-syntax-pre-token-generation)

## Format de la réponse

La lambda renvoie un événement où les attributs de la `request` restent inchangés, 
mais la partie `response` contient la nouvelle claim à ajouter dans l'idToken :

```
{
    "response":{
        "claimsOverrideDetails":{
            "claimsToAddOrOverride":{
                "sessionId":"42c5669a-729c-4d41-8297-6da4ab106492"
            }
        }
    }
}
```

Consultez la doc Cognito pour les [paramètres de la réponse](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-token-generation.html#cognito-user-pools-lambda-trigger-syntax-pre-token-generation-response)