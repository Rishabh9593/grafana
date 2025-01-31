import { useMemo } from 'react';

import { DataFrame, getFieldDisplayName, TransformerCategory } from '@grafana/data';
import { config } from '@grafana/runtime';

export function useAllFieldNamesFromDataFrames(input: DataFrame[]): string[] {
  return useMemo(() => {
    if (!Array.isArray(input)) {
      return [];
    }

    return Object.keys(
      input.reduce<Record<string, boolean>>((names, frame) => {
        if (!frame || !Array.isArray(frame.fields)) {
          return names;
        }

        return frame.fields.reduce((names, field) => {
          const t = getFieldDisplayName(field, frame, input);
          names[t] = true;
          return names;
        }, names);
      }, {})
    );
  }, [input]);
}

export function getDistinctLabels(input: DataFrame[]): Set<string> {
  const distinct = new Set<string>();
  for (const frame of input) {
    for (const field of frame.fields) {
      if (field.labels) {
        for (const k of Object.keys(field.labels)) {
          distinct.add(k);
        }
      }
    }
  }
  return distinct;
}

export const categoriesLabels: { [K in TransformerCategory]: string } = {
  combine: 'Combine',
  calculateNewFields: 'Calculate new fields',
  createNewVisualization: 'Create new visualization',
  filter: 'Filter',
  performSpatialOperations: 'Perform spatial operations',
  reformat: 'Reformat',
  reorderAndRename: 'Reorder and rename',
};

export const numberOrVariableValidator = (value: string | number) => {
  if (typeof value === 'number') {
    return true;
  }
  if (!Number.isNaN(Number(value))) {
    return true;
  }
  if (/^\$[A-Za-z0-9_]+$/.test(value) && config.featureToggles.transformationsVariableSupport) {
    return true;
  }
  return false;
};
