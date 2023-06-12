import { AvataxInstructions } from "../../../modules/avatax/ui/avatax-instructions";
import { EditAvataxConfiguration } from "../../../modules/avatax/ui/edit-avatax-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";
import { Section } from "../../../modules/ui/app-section";

const Header = () => {
  return <Section.Header>Edit your existing Avatax configuration</Section.Header>;
};

const EditAvataxPage = () => {
  return (
    <main>
      <AppColumns top={<Header />}>
        <AvataxInstructions />
        <EditAvataxConfiguration />
      </AppColumns>
    </main>
  );
};

export default EditAvataxPage;
