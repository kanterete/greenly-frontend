export function applyCatalogPlant(form, plant) {
  const sameSpecies = form.externalSpeciesId === plant.id;
  return {
    ...form,
    externalSpeciesId: plant.id,
    nickname: sameSpecies ? form.nickname : plant.commonName,
    imageUrl: sameSpecies ? form.imageUrl : plant.imageUrl || "",
    frequencyDays: sameSpecies && form.frequencyEdited
      ? form.frequencyDays : String(plant.wateringSuggestion?.days ?? ""),
    frequencyEdited: sameSpecies && !!form.frequencyEdited,
  };
}
