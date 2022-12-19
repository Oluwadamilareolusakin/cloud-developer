import * as React from "react";
import { GroupModel } from "../types/GroupModel";
import { Group } from "./Group";
import { getGroups } from "../api/groups-api";
import { Card, Button, Divider } from "semantic-ui-react";
import { History } from "history";
import { Navigate } from "react-router-dom";

interface GroupsListProps {}

interface GroupsListState {
  groups: GroupModel[];
  redirect: Boolean;
}

export class GroupsList extends React.PureComponent<
  GroupsListProps,
  GroupsListState
> {
  state: GroupsListState = {
    groups: [],
    redirect: false,
  };

  handleCreateGroup = () => {
    this.setState({
      redirect: true,
    });
  };

  async componentDidMount() {
    try {
      const groups = await getGroups();
      this.setState({
        groups,
      });
    } catch (e: any) {
      alert(`Failed to fetch groups: ${e.message}`);
    }
  }

  render() {
    return (
      <div>
        <h1>Groups</h1>
        {this.state.redirect && <Navigate to="/groups/create" replace={true} />}

        <Button
          primary
          size="huge"
          className="add-button"
          onClick={this.handleCreateGroup}
        >
          Create new group
        </Button>
        <Divider clearing />
        <Card.Group>
          {this.state.groups.map((group) => {
            return <Group key={group.id} group={group} />;
          })}
        </Card.Group>
      </div>
    );
  }
}
