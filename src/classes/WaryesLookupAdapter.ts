import { LookupService } from "@izohek/warno-deck-utils";
import { Unit, UnitMap } from "../types/unit";
import { Division } from "../types/deck-builder";

export class WaryesLookupAdapter implements LookupService {
    protected units: Unit[]
    protected divisions: Division[]

    constructor(
        units: UnitMap,
        divisions: Division[]
    ) {
        this.units = Object.values(units);
        this.divisions = divisions;
    }

    public largestUnitId(): number {
        return Object.values(this.units).reduce(
            (accumulator, currentValue) => Math.max(currentValue.id, accumulator),
            0
        )
    }

    public unitForId (id: number): string | undefined {
        return Object.values(this.units).find(
            u => u.id === id
        )?.descriptorName
    }

    public divisionForId (id: number): string | undefined {
        return this.divisions.find(
            d => d.id === id
        )?.descriptor
    }
}
