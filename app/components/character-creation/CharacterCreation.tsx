// app/components/character-creation/CharacterCreation.tsx
// Orchestrates the full character creation flow.

"use client";

import { useState } from "react";
import type {
    ClassDataPayload,
    ClassName,
    Faction,
    RaceName,
} from "@/app/types/game";
import FactionSelect from "./FactionSelect";
import RaceSelect from "./RaceSelect";
import ClassSelect from "./ClassSelect";
import NameInput from "./NameInput";

type Step = "faction" | "race" | "class" | "name";

interface CharacterCreationProps {
    classData: ClassDataPayload;
    onCreateCharacter: (name: string, race: string, classType: string) => void;
}

export default function CharacterCreation({
                                              classData,
                                              onCreateCharacter,
                                          }: CharacterCreationProps) {
    const [step, setStep] = useState<Step>("faction");
    const [faction, setFaction] = useState<Faction | null>(null);
    const [race, setRace] = useState<RaceName | null>(null);
    const [className, setClassName] = useState<ClassName | null>(null);

    const handleFaction = (f: Faction) => {
        setFaction(f);
        setStep("race");
    };

    const handleRace = (r: RaceName) => {
        setRace(r);
        setStep("class");
    };

    const handleClass = (c: ClassName) => {
        setClassName(c);
        setStep("name");
    };

    const handleName = (name: string) => {
        if (race && className) {
            onCreateCharacter(name, race, className);
        }
    };

    const racesForFaction = faction ? classData.factions[faction] : [];
    const classesForRace = racesForFaction.find((r) => r.name === race)?.classes ?? [];

    return (
        <div className="character-creation">
            <h1 className="character-creation__heading">Character Creation</h1>

            {step === "faction" && <FactionSelect onSelect={handleFaction} />}

            {step === "race" && faction && (
                <RaceSelect
                    faction={faction}
                    races={racesForFaction}
                    onSelect={handleRace}
                    onBack={() => setStep("faction")}
                />
            )}

            {step === "class" && race && (
                <ClassSelect
                    race={race}
                    classes={classesForRace}
                    onSelect={handleClass}
                    onBack={() => setStep("race")}
                />
            )}

            {step === "name" && faction && race && className && (
                <NameInput
                    faction={faction}
                    race={race}
                    className={className}
                    onConfirm={handleName}
                    onBack={() => setStep("class")}
                />
            )}
        </div>
    );
}