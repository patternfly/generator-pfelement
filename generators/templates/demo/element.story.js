import { storiesOf } from "@storybook/polymer";
import "../dist/<%= elementName %>";

storiesOf("<%= readmeName %>", module).add(
  "<%= elementName %>",
  () => `
  <<%= elementName %>>
    <%= readmeName %>
  </<%= elementName %>>
  `
);
