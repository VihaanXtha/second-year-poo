import { useEffect, useState } from "react";

export interface AddressValue {
  country: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  postal_code: string;
}

interface District {
  name: string;
  municipalities: string[];
}

interface Province {
  name: string;
  districts: District[];
}

interface AddressPickerProps {
  value?: AddressValue;
  onChange: (value: AddressValue) => void;
}

const DEFAULT_VALUE: AddressValue = {
  country: "Nepal",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  postal_code: "",
};

export function NepalAddressPicker({ value, onChange }: AddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const address = value ?? DEFAULT_VALUE;

  useEffect(() => {
    let cancelled = false;
    fetch("/nepal-address.json")
      .then((res) => res.json())
      .then((data: { provinces: Province[] }) => {
        if (!cancelled) setProvinces(data.provinces ?? []);
      })
      .catch((e) => console.error("Failed to load Nepal address data", e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedProvince = provinces.find((p) => p.name === address.province);
  const districts = selectedProvince?.districts ?? [];
  const selectedDistrict = districts.find((d) => d.name === address.district);
  const municipalities = selectedDistrict?.municipalities ?? [];

  const update = (patch: Partial<AddressValue>) => {
    const next = { ...address, ...patch };
    if (patch.province && patch.province !== address.province) {
      next.district = "";
      next.municipality = "";
    }
    if (patch.district && patch.district !== address.district) {
      next.municipality = "";
    }
    onChange(next);
  };

  const field =
    "mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-red-500 disabled:bg-slate-100 disabled:text-slate-500";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Country</label>
        <select value={address.country} disabled className={field}>
          <option value="Nepal">Nepal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Province <span className="text-red-600">*</span></label>
        <select
          value={address.province}
          onChange={(e) => update({ province: e.target.value })}
          className={field}
          required
        >
          <option value="">Select province</option>
          {provinces.map((province) => (
            <option key={province.name} value={province.name}>{province.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">District <span className="text-red-600">*</span></label>
        <select
          value={address.district}
          onChange={(e) => update({ district: e.target.value })}
          className={field}
          disabled={!address.province || loading}
          required
        >
          <option value="">{address.province ? "Select district" : "Select province first"}</option>
          {districts.map((district) => (
            <option key={district.name} value={district.name}>{district.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Municipality <span className="text-red-600">*</span></label>
        <select
          value={address.municipality}
          onChange={(e) => update({ municipality: e.target.value })}
          className={field}
          disabled={!address.district || loading}
          required
        >
          <option value="">{address.district ? "Select municipality" : "Select district first"}</option>
          {municipalities.map((municipality) => (
            <option key={municipality} value={municipality}>{municipality}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Ward Number <span className="text-red-600">*</span></label>
        <input
          type="number"
          min={1}
          value={address.ward}
          onChange={(e) => update({ ward: e.target.value })}
          className={field}
          placeholder="e.g. 5"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Postal Code <span className="text-red-600">*</span></label>
        <input
          type="text"
          value={address.postal_code}
          onChange={(e) => update({ postal_code: e.target.value })}
          className={field}
          placeholder="e.g. 44600"
          required
        />
      </div>
    </div>
  );
}
