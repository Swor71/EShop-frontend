import React, { Component } from 'react'
import { Mutation } from 'react-apollo';
import Form from "./styles/Form";
import formatMoney from '../lib/formatMoney';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Router from 'next/router';

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  }

  handleChange = (e) => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  }

  uploadFile = async (e) => {
    console.log('uploading file');
    const files = e.target.files;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'EShopPics');

    const res = await fetch('https://api.cloudinary.com/v1_1/die5oazt6/image/upload/', {
      method: 'POST',
      body: data});

      const file = await res.json();
      console.log(file);
      this.setState({
        image: file.secure_url,
        largeImage: file.eager[0].secure_url
      })
  }

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={async e => {
            e.preventDefault();
            //calling the mutation
            const res = await createItem();
            console.log(res);
            Router.push({
              pathname: `/item`,
              query: { id: res.data.createItem.id }
            })
          }}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input type="file" id="file" name="file" placeholder="Select an image" onChange={this.uploadFile} required />
                {this.state.image && <img width="200" src={this.state.image} alt="Upload Preview" />}
              </label>
              <label htmlFor="title">
                Title
                <input type="text" id="title" name="title" placeholder="Title" value={this.state.title} onChange={this.handleChange} required />
              </label>
              <label htmlFor="price">
                Price
                <input type="number" id="price" name="price" placeholder="Price" value={this.state.price} onChange={this.handleChange} required />
              </label>
              <label htmlFor="title">
                Description
                <textarea type="text" id="description" name="description" placeholder="Description" value={this.state.description} onChange={this.handleChange} required />
              </label>
              <button type="submit" >Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };