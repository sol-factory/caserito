import TemplateRow from "./TemplateRow";

export default async function TemplatesTable({ templates }) {
  return (
    <div
      className={`flex flex-col mt-5 ${
        templates.length > 5 ? "overflow-y-scroll" : ""
      }`}
    >
      {templates.map((t) => (
        <TemplateRow key={t._id} t={t} />
      ))}
    </div>
  );
}
