import CompositionItem from "./CompositionItem";
import IComposition from "../../models/composition.model";

interface ICompositionsProps {
  addComposition: Function;
  compositions: IComposition[];
  editCompositionTitle: Function;
  deleteComposition: Function;
}

export default function Compositions(props: ICompositionsProps) {
  const compositions = props.compositions.filter(
    (value, index, self) => index === self.findIndex((t) => t.id === value.id)
  );
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        marginBottom: "150px"
      }}
    >
      <div className="is-flex">
        <a
          href="# "
          onClick={() => props.addComposition()}
          className="card"
          style={{ width: "280px" }}
        >
          <header className="card-header">
            <p className="card-header-title">Add SkillTree</p>
          </header>
          <div className="card-image">
            <figure className="image">
              <img
                src="https://cdn.pixabay.com/photo/2018/11/13/21/44/instagram-3814061_1280.png"
                alt="add skilltree"
                style={{ height: "280px" }}
              ></img>
            </figure>
          </div>
        </a>
      </div>
      {compositions.map((composition) => (
        <div key={composition.id} className="is-flex">
          <CompositionItem
            composition={composition}
            editCompositionTitle={props.editCompositionTitle}
            deleteComposition={props.deleteComposition}
          />
        </div>
      ))}
    </div>
  );
}
