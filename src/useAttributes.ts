/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";
import { KeyValueAttribute } from "linkedrecords/browser_sdk";

interface KVValue {
  [key: string]: KVValue | string | boolean | number | undefined;
}

export function useKeyValueAttributes(query: any[]): KVValue[]  {
  const { lr } = useLinkedRecords();
  const [ attributes, setAttributes ] = useState<KVValue[]>([]);

  useEffect(() => {
    lr.Attribute.findAndLoadAll({
      attributes: [
        ['$it', '$hasDataType', KeyValueAttribute],
        ...query
      ],
    }).then(async ({ attributes }) => {
      const values = await Promise.all(attributes.map(async (a) => ({
        _id: a.id,
        ...(await a.getValue()),
      })));

      attributes.forEach((a) => {
        a.subscribe(async () => {
          const values = await Promise.all(attributes.map(async (a) => ({
            _id: a.id,
            ...(await a.getValue()),
          })));

          const newValues = await Promise.all(values.map(async (v) => {
            if (v._id === a.id) {
              return {
                _id: a.id,
                ...(await a.getValue()),
              }
            }

            return v;
          }));

          setAttributes(newValues);
        });
      })

      setAttributes(values);
    });
  }, [ lr.Attribute, setAttributes ]);

  return attributes;
}
