# Services en mémoire

Un service en mémoire respecte le même contrat applicatif qu'un vrai service, mais retourne des données conservées dans l'application au lieu d'appeler une API externe ou une base de données.

## Pourquoi les utiliser dans les tests automatisés ?

Les tests doivent être rapides, déterministes et centrés sur le comportement à vérifier. Un service en mémoire aide car il :

- évite de démarrer un backend, de configurer une base de données ou de faire des appels réseau ;
- retourne des données connues, afin que les assertions ne dépendent pas d'un état externe partagé ou changeant ;
- permet de représenter directement des cas utiles : aucun rendez-vous, un rendez-vous ou une requête en erreur ;
- garde les tests unitaires et de composants suffisamment rapides pour être exécutés fréquemment.

Un test peut ainsi vérifier que l'interface affiche les rendez-vous sans tester en même temps la disponibilité du serveur API.

## Pourquoi les utiliser pendant le développement manuel ?

Lors d'une vérification manuelle d'une fonctionnalité, le backend peut être inachevé, indisponible, vide ou contenir des données qui ne montrent pas le scénario en cours de développement. Un service en mémoire fournit immédiatement des données d'exemple stables.

Il est utile pour vérifier :

- la mise en page et les détails des rendez-vous ;
- les états de chargement, vide et erreur ;
- les cas limites difficiles à créer dans un environnement partagé ;
- une fonctionnalité hors ligne ou avant que le contrat de l'API soit prêt.

Il faut également utiliser le vrai service avant une livraison : le service en mémoire valide le comportement de l'application avec des données contrôlées, alors que le vrai service valide l'intégration avec l'API.

## Pourquoi ne pas utiliser un feature flag pour sélectionner le service ?

Les feature flags sont surtout adaptés à la publication progressive ou à l'expérimentation de comportements visibles par l'utilisateur. Sélectionner un service en mémoire ou un service de production relève généralement de la configuration de l'application : ce choix détermine la provenance de toutes les données, et non le comportement produit présenté à un utilisateur.

Utiliser un feature flag pour ce choix peut poser plusieurs problèmes :

- le chemin en mémoire peut être activé par erreur en production et afficher des données d'exemple au lieu des données réelles ;
- chaque valeur du flag crée une combinaison supplémentaire à tester et à maintenir ;
- la source de données peut changer à l'exécution, ce qui complique le raisonnement et le diagnostic pour un utilisateur ;
- l'infrastructure de feature flags doit être disponible avant que l'application puisse décider comment obtenir ses données.

Préférez une configuration explicite des tests pour les tests automatisés et une configuration locale ou de déploiement explicite pour le développement manuel. La source sélectionnée est alors visible au démarrage, et l'intégration de production reste séparée des décisions de déploiement progressif des fonctionnalités.

Des exceptions existent, par exemple pour une démonstration interne de courte durée ou un outil de support strictement contrôlé. Dans ce cas, limitez l'accès, rendez la source de données active visible et retirez le flag dès qu'il n'est plus nécessaire.

## Proposition : activer les données locales par fonctionnalité

Conservez les providers de source de données de production comme comportement par défaut. Pour le développement local et les tests, ajoutez une configuration séparée qui ne remplace que les fonctionnalités qu'un développeur souhaite exécuter en mémoire. Chaque fonctionnalité peut ainsi être activée ou désactivée indépendamment, sans modifier ses composants ni son implémentation de production.

1. Donnez à chaque fonctionnalité un jeton de service, par exemple `CATALOG_SERVICE` ou `BOOKING_SERVICE`. Les composants dépendent uniquement du jeton de leur fonctionnalité.
2. Enregistrez l'implémentation HTTP ou de production comme provider par défaut pour chaque jeton.
3. Créez une liste de providers réservée au développement et aux tests, capable de remplacer les jetons sélectionnés par leurs implémentations en mémoire.
4. Chargez cette liste uniquement depuis le démarrage ou la configuration locale de développement et de test, jamais depuis le démarrage de production.

Par exemple, une configuration locale peut rendre le choix explicite à un seul endroit :

```ts
const localDataSources = {
  catalog: 'memory',
  booking: 'api',
  customerProfile: 'memory',
} as const;
```

Le démarrage de développement transforme cette configuration en surcharges de providers. Une fonctionnalité à `'memory'` reçoit son service en mémoire ; une fonctionnalité à `'api'` conserve le service de production par défaut. Les tests peuvent réutiliser le même mécanisme avec leur propre petite configuration.

Cette approche rend le toggle facile à trouver et à relire, permet d'utiliser différentes sources de données selon les fonctionnalités et empêche le choix local d'être embarqué ou évalué par l'application de production. Conservez les préférences locales personnelles dans un fichier ignoré par Git ou injectez-les via une configuration d'environnement réservée au développement ; versionnez un fichier d'exemple sûr pour l'équipe.

## Changer d'implémentation

Utilisez l'injection de dépendances pour sélectionner une implémentation derrière un jeton de service ou une interface. Le code de l'application doit dépendre de cette abstraction, et non directement de l'implémentation en mémoire ou HTTP.

```ts
// Environnement de production ou d'intégration
provideDataService(HttpDataService)

// Environnement de test ou de développement local
provideDataService(InMemoryDataService)
```

La syntaxe exacte dépend du framework. L'essentiel est que changer la source des données ne demande aucune modification du code de la fonctionnalité ou du composant.
