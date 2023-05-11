import { collection, getDocs, getDocsFromCache, Firestore, loadBundle, namedQuery } from "firebase/firestore";
import { Division } from "../types/deck-builder";
import { FirebaseService, FirebaseServiceClass } from "./firebase";
import { getStorage, ref, getBlob } from "firebase/storage";
import { Unit } from "../types/unit";


const CURRENT_FILE_NAME = "bundle-divisions.txt"
const CURRENT_NAMED_QUERY = "divisions"

enum DivisionsFetchStrategy {
    local,
    cache,
    forceDirect
}

class DivisionDatabaseServiceClass {

    db?: Firestore;
    divisions?: Division[];

    isFetching = false;
    hasLoadedBundle = false;
    debug = false;
    _readCounter = 0;

    constructor(service: FirebaseServiceClass) {
        this.db = service.db;
    }

    /**
     * Fetch divisions from Firebase using a specified strategy.  Use the default cache strategy
     * unless you know what you're doing.
     * 
     * @param strategy 
     * @returns 
     */
    public async fetchDivisions(strategy: DivisionsFetchStrategy = DivisionsFetchStrategy.cache) {
        switch (strategy) {
            case DivisionsFetchStrategy.cache:
                if (this.debug) { console.log("Loading units from cache") }
                return await this.fetchDivisionsCache()
            case DivisionsFetchStrategy.forceDirect:
                if (this.debug) { console.log("Loading units from cloud") }
                return await this.fetchDivisionsForceDirect()
        }
        return [];
    }


    /**
     * Fetch divisions by loading a bundle file from firebase storage.  This will incur a storage
     * read if it is not already cached, but will otherwise not require any requests made to the
     * firestore database.
     *  
     * @returns 
     */
    async fetchDivisionsCache() {
        if (this.divisions) { 
            if (this.debug) { console.log("Cache loading from cache cache") }
            return this.divisions 
        }

        // Create a reference with an initial file path and name
        const storage = getStorage(FirebaseService.app);
        const pathReference = ref(storage, CURRENT_FILE_NAME);
        const bundleBlob = await getBlob(pathReference)
        const bundleBlobStr = await bundleBlob.text()

        if (this.db) {
            if (!this.hasLoadedBundle) {
                await loadBundle(this.db, bundleBlobStr)
                this.hasLoadedBundle = true
            }
        } else {
            this.isFetching = false
            throw new Error("Error loading bundle file")
        }

        const query = await namedQuery(this.db, CURRENT_NAMED_QUERY)
        if (!query) throw new Error("Failed to find named query")

        const divisionsQuery = await getDocsFromCache(query);

        this.divisions = divisionsQuery.docs.map( function(doc) {
            return doc.data() as Division
        });

        this._readCounter += this.divisions.length;
        if (this.debug) { console.log("Current Reads: ", this._readCounter) }
        
        this.isFetching = false;
        return this.divisions;
    }

    /**
     * Fetch divisions by querying firebase directly.  This will cause a number of firebase
     * requests equal to the number of divisions in the database.
     * 
     * @param force 
     * @returns 
     */
    async fetchDivisionsForceDirect(force: Boolean = false) {

        if (this.isFetching) return this.divisions ?? [];
        if (this.debug) { console.log("Fetch") }
        // Cache first
        if (this.divisions && !force) return this.divisions ?? [];
        if (this.debug) { console.log("No cache") }
        // Setup and attempt to fetch
        if (!this.db) return null;

        this.isFetching = true;
        const divisionsQuery = await getDocs(collection(this.db, 'divisions'));
        this.divisions = divisionsQuery.docs.map( function(doc) {
            return doc.data() as Division
        });

        this._readCounter += this.divisions.length;
        if (this.debug) { console.log("Current Reads: ", this._readCounter); }
        
        this.isFetching = false;
        return this.divisions;
    }

       /**
     * Find the divisions where this unit is available for call-in.
     * 
     * 1. Filter divisions where the alliance matches the unit
     * 2. For each remaining division, find a pack where the unit descriptor is present
     *  
     * @param unit 
     * @returns 
     */
       async divisionsForUnit(unit: Unit) {
        const divisions = await this.fetchDivisions();
        const nationalityDivisions = divisions?.filter( 
            division => division.alliance === unit.unitType.nationality
        );

        return nationalityDivisions?.filter( division => {
            return division.packs.find( pack => pack.unitDescriptor === unit.descriptorName);
        })
    }

    
}

const DivisionsDatabaseService = new DivisionDatabaseServiceClass(FirebaseService);
export { DivisionsDatabaseService, DivisionDatabaseServiceClass, DivisionsFetchStrategy };
