// SPDX-License-Identifier: Apache License
// compiler version must be greater than or equal to 0.8.17 and less than 0.9.0
pragma solidity ^0.8.17;

import "./ConsumeMsg.sol";

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function approve(address to, uint256 tokenId) external;

    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

interface IERC721Metadata is IERC721/*, IERC721Receiver*/ {

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    // do not know how to implement yet
    // function onERC721Received(
    //     address operator,
    //     address from,
    //     uint256 tokenId,
    //     bytes calldata data
    // ) external returns (bytes4);
}

contract ERC721 is IERC721Metadata, ConsumeMsg  {

    string private _name;
    string private _symbol;
    bool private isAcceptedToTransfer; // need to check the visuality 
    uint256 private nonce;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed id
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 indexed id
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    // Mapping from token ID to owner address
    mapping(uint256 => address) internal _ownerOf;

    // Mapping owner address to token count
    mapping(address => uint256) internal _balanceOf;

    // Mapping from token ID to approved address
    mapping(uint256 => address) internal _approvals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }
    
    function supportsInterface(bytes4 interfaceId)
        external
        pure
        returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint256 id) external view returns (address owner) {
        owner = _ownerOf[id];
        require(owner != address(0), "token doesn't exist");
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "owner = zero address");
        return _balanceOf[owner];
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint256 id) external {
        address owner = _ownerOf[id];
        require(
            msg.sender == owner || isApprovedForAll[owner][msg.sender],
            "not authorized"
        );

        _approvals[id] = spender;

        emit Approval(owner, spender, id);
    }

    function getApproved(uint256 id) external view returns (address) {
        require(_ownerOf[id] != address(0), "token doesn't exist");
        return _approvals[id];
    }

    function _isApprovedOrOwner(
        address owner,
        address spender,
        uint256 id
    ) internal view returns (bool) {
        return (spender == owner ||
            isApprovedForAll[owner][spender] ||
            spender == _approvals[id]);
    }

    function transferFrom(
        address from,
        address to,
        uint256 id
    ) public {
        require(from == _ownerOf[id], "from != owner");
        require(to != address(0), "transfer to zero address");
        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");
        require(!isAcceptedToTransfer, "you cannot transfer your Reward NFT"); // to make NFT untransferable
        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[id] = to;

        delete _approvals[id];

        emit Transfer(from, to, id);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id
    ) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 ||
                IERC721Receiver(to).onERC721Received(
                    msg.sender,
                    from,
                    id,
                    ""
                ) ==
                IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 ||
                IERC721Receiver(to).onERC721Received(
                    msg.sender,
                    from,
                    id,
                    data
                ) ==
                IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        // _requireMinted(tokenId);

        string memory baseURI = "x";
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, toString(tokenId))) : "";
    }

    function _mint(
        address _solver,
        uint256 id,
        uint256 _problemNumber,
        uint256 _timestamp,
        address _approverKeyAddr,
        uint8 _approverIndex,
        uint256 _nonce,
        bytes memory _signature
    ) internal {
        require(_solver != address(0), "mint to zero address");
        require(_ownerOf[id] == address(0), "already minted");
        require(msg.sender == _solver, "invalid msg sender");
        require(_nonce > nonce, "have minted before");
        require(VerifySignature(
            _solver,
            _problemNumber,
            _timestamp,
            _approverKeyAddr,
            _approverIndex,
            _nonce,
            _signature
        ), "not verified signer");
        _balanceOf[_solver]++;
        _ownerOf[id] = _solver;
        nonce += 1;
        emit Transfer(address(0), _solver, id);
    }

    function _burn(uint256 id) internal virtual {
        address owner = _ownerOf[id];
        require(owner != address(0), "not minted");

        _balanceOf[owner] -= 1;

        delete _ownerOf[id];
        delete _approvals[id];

        emit Transfer(owner, address(0), id);
    }

    function _exists(uint256 id) internal view returns(bool) {
        return _ownerOf[id] != address(0);
    } 

    // function onERC721Received(
    //     address operator,
    //     address from,
    //     uint256 tokenId,
    //     bytes calldata data
    // ) external returns (bytes4){
    //     return this.onERC721Received.selector;
    // }

    // Implementation of toString() from OZ
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    function _setIsAcceptedToTransfer(bool _transferStatus) internal {
        isAcceptedToTransfer = _transferStatus;
    }
}

abstract contract ERC721URIStorage is ERC721 {

    // tokenId => tokenURI
    mapping(uint256 => string) internal _tokenURIs;

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {

        string memory _tokenURI = _tokenURIs[tokenId];

        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(_tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    function _setTokenURI(uint256 id, string memory _tokenURI) internal virtual {
        require(_exists(id), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[id] = _tokenURI;
    }

    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
    }
}

contract Reward is ERC721URIStorage {

    uint256 private id = 0;
    mapping(address => bool) private owners;

    modifier onlyOwner(address msgSender) {
        require(owners[msgSender] == true, "not contract owner");
        _;
    }

    constructor() {
        owners[msg.sender] = true;
    }

    function mint(
        address _solver,
        uint256 _problemNumber,
        uint256 _timestamp,
        address _approverKeyAddr,
        uint8 _approverIndex,
        uint256 _nonce,
        bytes memory _signature,
        string memory _tokenURI
    ) external {

        _mint(_solver, id, _problemNumber, _timestamp, _approverKeyAddr, _approverIndex, _nonce, _signature);
        _setTokenURI(id, _tokenURI);
        id += 1;
    }

    function burn(uint256 _id) external {
        require(msg.sender == _ownerOf[id], "not owner");
        _burn(_id);
    }

    function setOwner(address _owner) public onlyOwner(msg.sender){
        owners[_owner] = true;
    }

    function setIsAcceptedToTransfer(bool _transferStatus) public onlyOwner(msg.sender){
        _setIsAcceptedToTransfer(_transferStatus);
    }
}
