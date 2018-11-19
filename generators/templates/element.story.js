import { storiesOf } from "@storybook/polymer";
import { withKnobs, text, select } from "@storybook/addon-knobs/polymer";
import "./<%= elementName %>";

const stories = storiesOf("<%= readmeName %>", module);
stories.addDecorator(withKnobs);

stories.add("<%= elementName %>", () => {
  // Attributes
  <% for(let i = 0; i < attributes.length; i++) { %>
  const <% attributes[i] %>Label = <% _.capitalize(attributes[i]) %>;
  const <% attributes[i] %>Options = {
    default: "default"
  };
  const <% attributes[i] %>Default = "default";
  const <% attributes[i] %>Value = select(<% attributes[i] %>Label, <% attributes[i] %>Options, <% attributes[i] %>Default);
  let <% attributes[i] %>Attr = <% attributes[i] %>Value != "default" ? ` <% attributes[i] %>="${<% attributes[i] %>Value}"` : "";
  <% } %>

  // Slots
  <% for(let i = 0; i < slots.length; i++) { %>
    const <% slots[i] %>Label = "<% _.capitalize(slots[i]) %>";
    const <% slots[i] %>Default = "Lorem ipsum";
    let <% slots[i] %>Value = text(<% slots[i] %>Label, <% slots[i] %>Default);
    <% } %>

  return `
  <section>
    <h2>Your RH Element</h2>
    <<%= elementName %><% for(let i = 0; i < attributes.length; i++) { %>${<% attributes[i] %>Attr} <% } %>>
      <%- for(let i = 0; i < slots.length; i++) { %>
        <span slot="<% slots[i] %>">${<% slots[i] %>Value}</span>
      <% } -%>
    </<%= elementName %>>
  </section>
  <section>
    <h2>Markup</h2>
    <pre><code>&lt;<%= elementName %><% for(let i = 0; i < attributes.length; i++) { %>${<% attributes[i] %>Attr} <% } %>&gt;
    <%- for(let i = 0; i < slots.length; i++) { %>
      &lt;span slot="<% slots[i] %>"&gt;${<% slots[i] %>Value}&lt;/span&gt;
    <% } -%>
    &lt;/<%= elementName %>&gt;</code></pre>
  </section>
  `
});
