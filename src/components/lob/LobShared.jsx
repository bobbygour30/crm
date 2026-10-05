export const YES_NO = ["Yes", "No"];
export const GENDERS = ["Male", "Female", "Other"];
export const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
export const QUALIFICATIONS = ["10th", "12th", "Graduate", "Post Graduate", "Professional", "Other"];
export const OCCUPATIONS = ["Salaried", "Business", "Professional", "Student", "Retired", "Housewife", "Other"];
export const NOMINEE_RELATIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Sibling", "Legal Heir", "Other"];
export const TENURES = ["1 Year", "2 Years", "3 Years"];

export const validateAadhaar = (v) => /^[0-9]{12}$/.test(v || "");
export const validatePAN = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v || "");
export const validatePIN = (v) => /^[0-9]{6}$/.test(v || "");
export const validatePassport = (v) => /^[A-PR-WY][1-9][0-9]{5}[1-9]$/.test(v || "");
export const validateMobile = (v) => /^[0-9]{10}$/.test(v || "");
export const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

export const todayStr = () => new Date().toISOString().split("T")[0];
export const maxAdultDob = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
};
export const addDaysStr = (s, n) => {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
};
// start + N years - 1 day
export const addYearsStr = (s, years) => {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + years);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0];
};
export const fmtDate = (v) => {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

export const range = (from, to, step) => {
  const a = [];
  for (let n = from; n <= to; n += step) a.push(n);
  return a;
};
export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
export const rupeeOptions = (arr) => arr.map((n) => ({ label: inr(n), value: String(n) }));

export const hasFile = (v) => v instanceof File || (typeof v === "string" && v.length > 0);
// JSON.stringify that silently drops File objects (existing URL strings are kept)
export const stripFiles = (obj) => JSON.stringify(obj, (k, v) => (v instanceof File ? undefined : v));

export const fetchPinInfo = async (pin) => {
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const d = await r.json();
    if (d?.[0]?.Status === "Success" && d[0].PostOffice?.length) {
      const p = d[0].PostOffice[0];
      return { state: p.State || "", city: p.District || p.Name || "" };
    }
  } catch (e) {
    console.error("PIN lookup failed", e);
  }
  return null;
};

export const inputCls = (err) =>
  `w-full p-2 border rounded-lg text-sm ${err ? "border-red-500" : "border-gray-300"}`;

export const Field = ({ label, required, error, hint, className = "", children }) => (
  <div className={className}>
    <label className="text-xs font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Select = ({ options, placeholder = "Select", ...rest }) => (
  <select {...rest}>
    <option value="">{placeholder}</option>
    {options.map((o) =>
      typeof o === "object" ? (
        <option key={o.value} value={o.value}>{o.label}</option>
      ) : (
        <option key={o} value={o}>{o}</option>
      )
    )}
  </select>
);

export const FileInput = ({ label, value, onChange, error, required, name, accept = ".pdf,.jpg,.jpeg" }) => (
  <Field label={label} required={required} error={error}>
    {typeof value === "string" && value && (
      <div className="mb-1">
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">
          View current file
        </a>
      </div>
    )}
    <input
      data-field={name}
      type="file"
      accept={accept}
      onChange={(e) => {
        const f = e.target.files[0];
        if (f) onChange(f);
      }}
      className={inputCls(error)}
    />
    {value instanceof File && <p className="text-xs text-green-600 mt-1">✓ {value.name}</p>}
  </Field>
);