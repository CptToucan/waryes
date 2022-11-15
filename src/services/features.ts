type FeatureStates = { [key: string]: boolean; };

class FeatureService {

    private _features: FeatureStates;

    constructor (features: FeatureStates) {
        this._features = features;
    }

    /**
     * Check if feature is enabled.  Unknown features return false.
     * 
     * @param feature name of feature as defined in FeatureStates
     * @returns enabled state
     */
    public enabled(feature: string): boolean {
        return this._features[feature] ?? false;
    }
}

/// Master list of features plus name/key helpers
const Features = {
    firebase_auth: "firebase_auth"
}

/// System feature states
const DefaultFeatureStates = {
    [Features.firebase_auth]: false,
}

const featureService = new FeatureService(DefaultFeatureStates);
export { Features, FeatureService, featureService }
